const express = require('express');
const router = express.Router();
const connection = require('../Config/db');
const bcrypt = require('bcryptjs'); // Para comparar contraseñas
const crypto = require('crypto'); // Para generar el token de sesión
const axios = require('axios'); // Para reCAPTCHA

const LOCK_TIME_MINUTES = 20; // Tiempo de bloqueo en minutos

router.post('/login', async (req, res) => {
    const { correo, password, captchaValue } = req.body;

    console.log('Datos recibidos del frontend:', { correo, password, captchaValue });

    // Validar reCAPTCHA antes de proceder con el login
    try {
        const recaptchaResponse = await axios.post(
            `https://www.google.com/recaptcha/api/siteverify?secret=6LcKwWEqAAAAAN5jWmdv3NLpvl6wSeIRRnm9Omjq&response=${captchaValue}`
        );
        console.log('Respuesta de reCAPTCHA:', recaptchaResponse.data);

        if (!recaptchaResponse.data.success) {
            console.log('Fallo en la verificación de reCAPTCHA');
            return res.status(400).json({ error: 'Error en la verificación de reCAPTCHA' });
        }
    } catch (error) {
        console.error('Error en la validación de reCAPTCHA:', error);
        return res.status(500).json({ error: 'Error en la verificación de reCAPTCHA' });
    }

    // Consulta a la base de datos para encontrar al usuario por correo
    const query = 'SELECT * FROM usuarios WHERE correo = ?';
    connection.query(query, [correo], (err, results) => {
        if (err) {
            console.error('Error en la base de datos:', err);
            return res.status(500).json({ error: 'Error en la base de datos' });
        }

        console.log('Resultados de la consulta de usuario:', results);

        if (results.length === 0) {
            console.log('Usuario no encontrado:', correo);
            return res.status(401).json({ error: 'Usuario no encontrado' });
        }

        const usuario = results[0];
        const currentTime = Date.now(); // Hora actual en milisegundos

        // Verificar si el usuario está bloqueado
        const queryAttempts = 'SELECT * FROM login_attempts WHERE usuarios_id = ?';
        connection.query(queryAttempts, [usuario.id], (err, attemptsResult) => {
            if (err) {
                console.error('Error al consultar los intentos de login:', err);
                return res.status(500).json({ error: 'Error en la base de datos' });
            }

            let lockUntil = null;

            if (attemptsResult.length > 0) {
                const attempt = attemptsResult[0];
                lockUntil = attempt.fecha_bloqueo;
            }

            if (lockUntil && currentTime < lockUntil) {
                const remainingTime = Math.round((lockUntil - currentTime) / 60000); // Convertir ms a minutos
                return res.status(403).json({ error: `Cuenta bloqueada. Inténtalo de nuevo en ${remainingTime} minutos.` });
            }

            // Comparar contraseñas
            bcrypt.compare(password, usuario.password, (err, isMatch) => {
                if (err) {
                    console.error('Error al comparar contraseñas:', err);
                    return res.status(500).json({ error: 'Error al comparar contraseñas' });
                }

                if (!isMatch) {
                    let loginAttempts = 1;
                    let newLockUntil = null;

                    if (attemptsResult.length > 0) {
                        loginAttempts = attemptsResult[0].intentos_fallidos + 1;
                    }

                    if (loginAttempts >= 5) {
                        newLockUntil = Date.now() + LOCK_TIME_MINUTES * 60 * 1000; // Bloqueo en milisegundos
                        loginAttempts = 0;
                    }

                    const updateAttemptsQuery = `
                        INSERT INTO login_attempts (usuarios_id, intentos_fallidos, fecha_bloqueo)
                        VALUES (?, ?, ?)
                        ON DUPLICATE KEY UPDATE intentos_fallidos = ?, fecha_bloqueo = ?`;

                    connection.query(updateAttemptsQuery, [usuario.id, loginAttempts, newLockUntil, loginAttempts, newLockUntil], (err) => {
                        if (err) {
                            console.error('Error al actualizar intentos de login:', err);
                            return res.status(500).json({ error: 'Error al procesar el inicio de sesión' });
                        }

                        if (newLockUntil) {
                            return res.status(403).json({ error: `Cuenta bloqueada por ${LOCK_TIME_MINUTES} minutos debido a demasiados intentos fallidos.` });
                        }

                        return res.status(401).json({ error: 'Contraseña incorrecta' });
                    });
                } else {
                    // Generar el token de sesión
                    const sessionToken = crypto.randomBytes(64).toString('hex');

                    // Guardar el token en la columna `cookie` de la base de datos
                    const updateTokenQuery = 'UPDATE usuarios SET cookie = ? WHERE id = ?';
                    connection.query(updateTokenQuery, [sessionToken, usuario.id], (err) => {
                        if (err) {
                            console.error('Error al guardar el token en la base de datos:', err);
                            return res.status(500).json({ error: 'Error al procesar el inicio de sesión' });
                        }

                        // Establecer cookie en la respuesta
                        res.cookie('COOKIES', sessionToken, {
                            httpOnly: true,
                            secure: process.env.NODE_ENV === 'production', // Activar en producción
                            sameSite: 'Lax',
                            maxAge: 24 * 60 * 60 * 1000 // 1 día
                        });

                        console.log('Autenticación exitosa y cookie establecida.');
                        res.json({
                            user: usuario.correo,
                            tipo: usuario.tipo
                        });
                    });
                }
            });
        });
    });
});

module.exports = router;
