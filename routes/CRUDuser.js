const express = require('express');
const router = express.Router();
const connection = require('../Config/db');
const bcrypt = require('bcryptjs'); // Importar bcrypt para comparar contraseñas
const axios = require('axios'); // Para hacer la solicitud a Google reCAPTCHA

// Tu clave secreta de reCAPTCHA, obtenida desde el panel de Google
const RECAPTCHA_SECRET_KEY = '6LcKwWEqAAAAAN5jWmdv3NLpvl6wSeIRRnm9Omjq';

router.post('/login', async (req, res) => {
    const { email, password, captchaValue } = req.body; // Recibir el token de reCAPTCHA junto con email y password

    console.log('Datos recibidos del frontend:', { email, password, captchaValue });

    // Validar el reCAPTCHA antes de proceder con el login
    try {
        const recaptchaResponse = await axios.post(`https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET_KEY}&response=${captchaValue}`);

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

        console.log('Resultados de la consulta:', results);
        if (results.length === 0) {
            console.log('Usuario no encontrado:', email);
            return res.status(401).json({ error: 'Usuario no encontrado' });
        }

        const usuario = results[0];
        console.log('Usuario encontrado en la base de datos:', usuario);

        // Comparar la contraseña usando bcrypt
        bcrypt.compare(password, usuario.password, (err, isMatch) => {
            if (err) {
                console.error('Error al comparar contraseñas:', err);
                return res.status(500).json({ error: 'Error al comparar contraseñas' });
            }

            if (!isMatch) {
                console.log('Contraseña incorrecta');
                return res.status(401).json({ error: 'Contraseña incorrecta' });
            }

            console.log('Autenticación exitosa');
            res.json({
                user: usuario.correo,  // Envía el correo del usuario autenticado
                tipo: usuario.tipo,     // Envía el tipo de usuario
            });
        });
    });
});

module.exports = router;