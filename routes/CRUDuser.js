const express = require('express');
const router = express.Router();
const connection = require('../Config/db');
const bcrypt = require('bcryptjs'); // Importar bcrypt para comparar contraseñas
const axios = require('axios'); // Para hacer la solicitud a Google reCAPTCHA

const LOCK_TIME_MINUTES = 20; // Tiempo de bloqueo en minutos

router.post('/login', async (req, res) => {
    const { correo, password, captchaValue } = req.body;

    console.log('Datos recibidos del frontend:', { correo, password, captchaValue });

    // Validar el reCAPTCHA antes de proceder con el login
    try {
        const recaptchaResponse = await axios.post(`https://www.google.com/recaptcha/api/siteverify?secret=6LcKwWEqAAAAAN5jWmdv3NLpvl6wSeIRRnm9Omjq&response=${captchaValue}`);
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
        console.log('Usuario encontrado:', usuario);

        const currentTime = Date.now(); // Obtener la hora actual

        // Verificar si el usuario está bloqueado
        const queryAttempts = 'SELECT * FROM login_attempts WHERE usuarios_id = ?';
        connection.query(queryAttempts, [usuario.id], (err, attemptsResult) => {
            if (err) {
                console.error('Error al consultar los intentos de login:', err);
                return res.status(500).json({ error: 'Error en la base de datos' });
            }

            console.log('Resultados de intentos de login:', attemptsResult);

            let lockUntil = null;

            if (attemptsResult.length > 0) {
                const attempt = attemptsResult[0];
                lockUntil = attempt.fecha_bloqueo;
            }

            // Verificar si el usuario está bloqueado
            if (lockUntil && currentTime < lockUntil) {
                const remainingTime = Math.round((lockUntil - currentTime) / 60000); // Convertir ms a minutos
                console.log(`Cuenta bloqueada. Inténtalo de nuevo en ${remainingTime} minutos.`);
                return res.status(403).json({ error: `Cuenta bloqueada. Inténtalo de nuevo en ${remainingTime} minutos.` });
            }

            // Si no está bloqueado, comparar la contraseña
            console.log('Comparando contraseñas...');
            bcrypt.compare(password, usuario.password, (err, isMatch) => {
                if (err) {
                    console.error('Error al comparar contraseñas:', err);
                    return res.status(500).json({ error: 'Error al comparar contraseñas' });
                }

                if (!isMatch) {
                    console.log('Contraseña incorrecta');

                    // Incrementar el número de intentos fallidos
                    let loginAttempts = 1;
                    let newLockUntil = null;

                    if (attemptsResult.length > 0) {
                        loginAttempts = attemptsResult[0].intentos_fallidos + 1;
                    }

                    console.log(`Intentos fallidos: ${loginAttempts}`);

                    // Si los intentos fallidos alcanzan el máximo permitido, bloquear la cuenta
                    if (loginAttempts >= 5) {
                        newLockUntil = Date.now() + LOCK_TIME_MINUTES * 60 * 1000; // Bloqueo en milisegundos
                        loginAttempts = 0; // Reiniciar intentos después del bloqueo
                        console.log(`Cuenta bloqueada por ${LOCK_TIME_MINUTES} minutos.`);
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
                    console.log('Contraseña correcta, restableciendo intentos fallidos.');

                    // Restablecer intentos fallidos si la autenticación es exitosa
                    const resetAttemptsQuery = 'DELETE FROM login_attempts WHERE usuarios_id = ?';
                    connection.query(resetAttemptsQuery, [usuario.id], (err) => {
                        if (err) {
                            console.error('Error al restablecer intentos de login:', err);
                            return res.status(500).json({ error: 'Error al procesar el inicio de sesión' });
                        }

                        console.log('Autenticación exitosa');
                        res.json({
                            user: usuario.correo,  // Envía el correo del usuario autenticado
                            tipo: usuario.tipo,     // Envía el tipo de usuario
                        });
                    });
                }
            });
        });
    });
});

module.exports = router;
