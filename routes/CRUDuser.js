const express = require('express');
const router = express.Router();
const connection = require('../Config/db');
const bcrypt = require('bcryptjs'); // Importar bcrypt para comparar contraseñas
const axios = require('axios'); // Para hacer la solicitud a Google reCAPTCHA

const MAX_ATTEMPTS = 5; // Número máximo de intentos fallidos
const LOCK_TIME_MINUTES = 20; // Tiempo de bloqueo en minutos

// Tu clave secreta de reCAPTCHA, obtenida desde el panel de Google
const RECAPTCHA_SECRET_KEY = '6LcKwWEqAAAAAN5jWmdv3NLpvl6wSeIRRnm9Omjq';

router.post('/login', async (req, res) => {
    const { email, password, captchaValue } = req.body;

    console.log('Datos recibidos del frontend:', { email, password, captchaValue });

    // Validar el reCAPTCHA antes de proceder con el login
    try {
        const recaptchaResponse = await axios.post(`https://www.google.com/recaptcha/api/siteverify?secret=6LcKwWEqAAAAAN5jWmdv3NLpvl6wSeIRRnm9Omjq&response=${captchaValue}`);

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
    connection.query(query, [email], (err, results) => {
        if (err) {
            console.error('Error en la base de datos:', err);
            return res.status(500).json({ error: 'Error en la base de datos' });
        }

        if (results.length === 0) {
            console.log('Usuario no encontrado:', email);
            return res.status(401).json({ error: 'Usuario no encontrado' });
        }

        const usuario = results[0];
        const currentTime = Date.now(); // Obtener la hora actual

        // Verificar si el usuario está bloqueado
        if (usuario.lock_until && currentTime < usuario.lock_until) {
            const remainingTime = Math.round((usuario.lock_until - currentTime) / 60000); // Convertir ms a minutos
            return res.status(403).json({ error: `Cuenta bloqueada. Inténtalo de nuevo en ${remainingTime} minutos.` });
        }

        // Comparar la contraseña usando bcrypt
        bcrypt.compare(password, usuario.password, (err, isMatch) => {
            if (err) {
                console.error('Error al comparar contraseñas:', err);
                return res.status(500).json({ error: 'Error al comparar contraseñas' });
            }

            if (!isMatch) {
                console.log('Contraseña incorrecta');

                // Incrementar el número de intentos fallidos
                let loginAttempts = usuario.login_attempts + 1;
                let lockUntil = null;

                // Si los intentos fallidos alcanzan el máximo permitido, bloquear la cuenta
                if (loginAttempts >= MAX_ATTEMPTS) {
                    lockUntil = Date.now() + LOCK_TIME_MINUTES * 60 * 1000; // Tiempo de bloqueo en milisegundos
                    loginAttempts = 0; // Reiniciar intentos después del bloqueo
                }

                // Actualizar la base de datos con los intentos fallidos y el tiempo de bloqueo
                const updateQuery = 'UPDATE usuarios SET login_attempts = ?, lock_until = ? WHERE correo = ?';
                connection.query(updateQuery, [loginAttempts, lockUntil, email], (err) => {
                    if (err) {
                        console.error('Error al actualizar intentos de login:', err);
                        return res.status(500).json({ error: 'Error al procesar el inicio de sesión' });
                    }
                    if (lockUntil) {
                        return res.status(403).json({ error: `Cuenta bloqueada por ${LOCK_TIME_MINUTES} minutos debido a demasiados intentos fallidos.` });
                    }
                    return res.status(401).json({ error: 'Contraseña incorrecta' });
                });
            } else {
                // Restablecer los intentos fallidos y el bloqueo si la autenticación es exitosa
                const resetAttemptsQuery = 'UPDATE usuarios SET login_attempts = 0, lock_until = NULL WHERE correo = ?';
                connection.query(resetAttemptsQuery, [email], (err) => {
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

module.exports = router;
