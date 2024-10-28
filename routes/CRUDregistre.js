const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); // Para hashear contraseñas
const db = require('../Config/db'); // Conexión a la base de datos
const nodemailer = require('nodemailer');

// Configuración de nodemailer para envío de correos
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'yarelihh2023@gmail.com',
        pass: 'fgpn vbfd cord nxvu', // Se recomienda usar variables de entorno para contraseñas
    },
});

// Función para generar un token aleatorio
const generateToken = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// Endpoint para registrar un usuario
router.post('/registro', (req, res) => {
    const { nombre, apellidoPaterno, apellidoMaterno, correo, telefono, password } = req.body;

    // Verificación de campos requeridos
    if (!nombre || !apellidoPaterno || !apellidoMaterno || !correo || !password) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios excepto el teléfono' });
    }

    // Hashear la contraseña con bcrypt
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            console.error('Error al hashear la contraseña:', err);
            return res.status(500).json({ message: 'Error al registrar el usuario' });
        }

        // Consulta SQL para insertar en la tabla 'usuarios'
        const query = `
            INSERT INTO usuarios (nombre, apellido_paterno, apellido_materno, correo, telefono, password, tipo, estado)
            VALUES (?, ?, ?, ?, ?, ?, 'usuario', 'activo')`;

        db.query(query, [nombre, apellidoPaterno, apellidoMaterno, correo, telefono || null, hashedPassword], (err, result) => {
            if (err) {
                console.error('Error al insertar usuario en la base de datos:', err);
                return res.status(500).json({ message: 'Error al registrar el usuario' });
            }

            res.status(201).json({ message: 'Usuario registrado exitosamente' });
        });
    });
});

// Endpoint para verificar si el correo existe
router.post('/verificar-correo', (req, res) => {
    const { correo } = req.body;

    const query = `SELECT * FROM usuarios WHERE correo = ?`;
    db.query(query, [correo], (err, results) => {
        if (err) {
            console.error('Error al verificar el correo en la base de datos:', err);
            return res.status(500).json({ message: 'Error al verificar el correo' });
        }

        if (results.length > 0) {
            // Si se encuentra el correo, retornamos que ya existe
            res.status(200).json({ exists: true });
        } else {
            res.status(200).json({ exists: false });
        }
    });
});

// Endpoint para enviar correo de verificación
router.post('/send-verification-email', (req, res) => {
    const { correo } = req.body;

    const checkUserSql = 'SELECT * FROM usuarios WHERE correo = ?';
    db.query(checkUserSql, [correo], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Error al verificar el correo electrónico.' });
        }

        if (result.length > 0 && result[0].verificado === 1) {
            return res.status(400).json({ message: 'El correo electrónico ya está registrado y verificado.' });
        }

        // Generar token de verificación
        const verificationToken = generateToken();
        const tokenExpiration = new Date(Date.now() + 900000); // Expira en 15 minutos

        const sql = `
            UPDATE usuarios SET token_verificacion = ?, token_expiracion = ?, verificado = 0 WHERE correo = ?
        `;

        db.query(sql, [verificationToken, tokenExpiration, correo], async (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Error al generar el token de verificación.' });
            }

            // Generar enlace de verificación
            const verificationLink = `https://backendgislive.onrender.com/api/verify-email?token=${verificationToken}&correo=${encodeURIComponent(correo)}`;

            // Opciones de correo
            const mailOptions = {
                from: '20221124@uthh.edu.mx',
                to: correo,
                subject: 'Confirmación de Correo - Gislive Boutique',
                html: `
                    <div style="font-family: Arial, sans-serif; color: #333;">
                        <div style="text-align: center; padding: 20px;">
                            <h1 style="color: #1976d2;">Gislive Boutique</h1>
                            <p>Hola y bienvenido</p>
                            <p>Agradecemos que te hayas registrado en <b>Gislive Boutique</b>. Para finalizar tu registro, por favor confirma tu dirección de correo electrónico usando el siguiente código:</p>
                            <div style="padding: 10px; background-color: #f0f0f0; border-radius: 5px; display: inline-block; margin: 20px 0;">
                                <span style="font-size: 24px; font-weight: bold; color: #1976d2;">${verificationToken}</span>
                            </div>
                            <p>Introduce este código en la página de confirmación de tu cuenta.</p>
                            <p style="color: #d32f2f; font-weight: bold; font-size: 18px;">El código debe ser ingresado exactamente como aparece, respetando mayúsculas, minúsculas y símbolos.</p>
                            <p><b>Importante:</b> Este código expirará en 15 minutos.</p>
                            <hr style="margin: 20px 0;">
                        </div>
                    </div>
                `,
            };

            // Enviar correo
            try {
                await transporter.sendMail(mailOptions);
                res.status(200).json({ message: 'Correo de verificación enviado.' });
            } catch (mailError) {
                return res.status(500).json({ message: 'Error al enviar el correo de verificación.' });
            }
        });
    });
});

module.exports = router;
