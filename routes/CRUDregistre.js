const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); // Importar bcrypt para hashear contraseñas
const db = require('../Config/db'); // Conexión a la base de datos desde db.jsssss
const nodemailer = require('nodemailer');

// Configuración de nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'yarelihh2023@gmail.com',
        pass: 'fgpn vbfd cord nxvu',
    },
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
            // Si no se encuentra, retornamos que no existe
            res.status(200).json({ exists: false });
        }
    });
});

// Endpoint para registrar un usuario
router.post('/registro', (req, res) => {
    const { nombre, apellidoPaterno, apellidoMaterno, correo, telefono, password } = req.body;

    // Verificar que los campos requeridos están presentes
    if (!nombre || !apellidoPaterno || !apellidoMaterno || !correo || !password) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios excepto el teléfono' });
    }

    // Hashear la contraseña usando bcrypt
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            console.error('Error al hashear la contraseña:', err);
            return res.status(500).json({ message: 'Error al registrar el usuario' });
        }

        // Generar el código de verificación
        const verificationCode = crypto.randomInt(100000, 999999).toString();

        // Consulta SQL para insertar los datos en la tabla 'usuarios'
        const query = `
            INSERT INTO usuarios (nombre, apellido_paterno, apellido_materno, correo, telefono, password, tipo, estado, verification_code)
            VALUES (?, ?, ?, ?, ?, ?, 'usuario', 'pendiente', ?)`;

        // Ejecución de la consulta con la contraseña hasheada y el código de verificación
        db.query(query, [nombre, apellidoPaterno, apellidoMaterno, correo, telefono || null, hashedPassword, verificationCode], (err, result) => {
            if (err) {
                console.error('Error al insertar usuario en la base de datos:', err);
                return res.status(500).json({ message: 'Error al registrar el usuario' });
            }

            // Configuración del correo de verificación
            const mailOptions = {
                from: 'yarelihh2023@gmail.com',
                to: correo,
                subject: 'Verificación de correo electrónico',
                text: `Tu código de verificación es: ${verificationCode}`
            };

            // Enviar el correo con el código de verificación
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error("Error al enviar el correo:", error);
                    return res.status(500).json({ message: "Error al enviar el correo de verificación", error: error.message });
                }
                console.log("Correo enviado:", info.response);
                res.status(201).json({ message: "Usuario creado. Por favor verifica tu correo electrónico." });
            });
        });
    });
});



router.post('/send-verification-email', (req, res) => { 
    const { email } = req.body;

    const checkUserSql = 'SELECT * FROM usuarios WHERE email = ?';
    db.query(checkUserSql, [email], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Error al verificar el correo electrónico.' });
        }

        if (result.length > 0 && result[0].verificado === 1) {
            return res.status(400).json({ message: 'El correo electrónico ya está registrado.' });
        }

        if (result.length > 0) {
            return res.status(400).json({ message: 'El correo electrónico ya está registrado.' });
        }
        // Generar token
        const verificationToken = generateToken();

        const tokenExpiration = new Date(Date.now() + 900000); // Expira en 15 minutos

        const sql = `
            INSERT INTO usuarios (email, token_verificacion, token_expiracion, verificado)
            VALUES (?, ?, ?, 0)
        `;
        db.query(sql, [email, verificationToken, tokenExpiration], async (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Error al generar el token de verificación.' });
            }

             // Generar el enlace de verificación correctamente
             const verificationLink = `https://backendgislive.onrender.com/api/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`;

             const mailOptions = {
                from: '20221124@uthh.edu.mx',
                to: email,
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

