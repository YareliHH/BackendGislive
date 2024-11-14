const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../Config/db');
const nodemailer = require('nodemailer');

// Configuración de nodemailer para envío de correos
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'yarelihh2023@gmail.com',
        pass: 'dmlw lpuo jfbp nejb',
    },
});

// Función para generar un token aleatorio de 6 dígitos
const generateToken = () => Math.floor(100000 + Math.random() * 900000).toString();

// Función para enviar el correo de verificación
const sendVerificationEmail = async (correo, verificationToken, res) => {
    const mailOptions = {
        from: '20221124@uthh.edu.mx',
        to: correo,
        subject: 'Confirmación de Correo - Gislive Boutique',
        html: `
            <div style="font-family: Arial, sans-serif; color: #333;">
                <div style="text-align: center; padding: 20px;">
                    <h1 style="color: #1976d2;">Gislive Boutique</h1>
                    <p>Para completar el registro, usa el siguiente código de verificación:</p>
                    <div style="padding: 10px; background-color: #f0f0f0; border-radius: 5px; display: inline-block; margin: 20px 0;">
                        <span style="font-size: 24px; font-weight: bold; color: #1976d2;">${verificationToken}</span>
                    </div>
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
        console.error('Error al enviar el correo de verificación:', mailError);
        res.status(500).json({ message: 'Error al enviar el correo de verificación.' });
    }
};

// Endpoint para verificar si el correo existe y enviar código de verificación si no existe
router.post('/verificar-correo', (req, res) => {
    const { correo } = req.body;

    const query = `SELECT * FROM usuarios WHERE correo = ?`;
    db.query(query, [correo], (err, results) => {
        if (err) {
            console.error('Error al verificar el correo en la base de datos:', err);
            return res.status(500).json({ message: 'Error al verificar el correo' });
        }

        if (results.length > 0) {
            return res.status(200).json({ exists: true });
        } else {
            // Generar token y crear un registro temporal en la tabla 'usuarios'
            const verificationToken = generateToken();
            const tokenExpiration = new Date(Date.now() + 900000); // Expira en 15 minutos

            const sql = `
                INSERT INTO usuarios (correo, registro_completo, token_verificacion, token_expiracion, tipo, estado)
                VALUES (?, 0, ?, ?, 'usuario', 'pendiente')
            `;

            db.query(sql, [correo, verificationToken, tokenExpiration], (err) => {
                if (err) {
                    console.error('Error al crear el registro temporal del usuario:', err);
                    return res.status(500).json({ message: 'Error al crear el registro temporal.' });
                }

                sendVerificationEmail(correo, verificationToken, res);
            });
        }
    });
});

// Endpoint para verificar el token antes de completar el registro
router.post('/verify-token', (req, res) => {
    const { correo, token } = req.body;

    const query = `SELECT * FROM usuarios WHERE correo = ? AND token_verificacion = ? AND token_expiracion > NOW()`;
    db.query(query, [correo, token], (err, results) => {
        if (err) {
            console.error('Error al verificar el token:', err);
            return res.status(500).json({ message: 'Error al verificar el token' });
        }

        if (results.length > 0) {
            return res.status(200).json({ valid: true });
        } else {
            return res.status(400).json({ valid: false, message: 'Token inválido o expirado.' });
        }
    });
});

// Endpoint para registrar un usuario y marcar el registro como completo
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

        // Consulta SQL para actualizar el registro temporal y completar el registro
        const sql = `
            UPDATE usuarios 
            SET nombre = ?, apellido_paterno = ?, apellido_materno = ?, telefono = ?, password = ?, estado = 'activo', registro_completo = 1
            WHERE correo = ? AND registro_completo = 0
        `;

        db.query(sql, [nombre, apellidoPaterno, apellidoMaterno, telefono || null, hashedPassword, correo], (err, result) => {
            if (err) {
                console.error('Error al completar el registro del usuario en la base de datos:', err);
                return res.status(500).json({ message: 'Error al completar el registro del usuario' });
            }

            if (result.affectedRows === 0) {
                // No se encontró un registro temporal para este correo o ya está completo
                return res.status(400).json({ message: 'Registro incompleto o ya existente. Verifica el token de verificación.' });
            }

            res.status(201).json({ message: 'Usuario registrado exitosamente' });
        });
    });
});

// Recuperación de contraseña
router.post('/recuperacion_contra', async (req, res) => {
    const { correo } = req.body;  // Cambiado a 'correo' para coincidir con el frontend

    console.log(`Intento de recuperación de contraseña para el correo: ${correo}`);

    // Validar formato de correo electrónico
    if (!validateEmail(correo)) {
        return res.status(400).json({ message: 'Formato de correo inválido.' });
    }

    // Verificar si el correo existe en la tabla `usuarios`
    const checkUserSql = 'SELECT * FROM usuarios WHERE correo = ?';
    db.query(checkUserSql, [xss(correo)], (err, result) => {
        if (err) {
            console.error('Error al verificar el correo electrónico:', err);
            return res.status(500).json({ message: 'Error al verificar el correo electrónico.' });
        }

        if (result.length === 0) {
            return res.status(404).json({ message: 'No existe una cuenta con este correo electrónico.' });
        }

        // Generar un token de recuperación y establecer expiración (15 minutos)
        const token = generateToken();
        const tokenExpiration = new Date(Date.now() + 900000); // Expira en 15 minutos

        // Actualizar la tabla `usuarios` con el token de verificación y la expiración
        const updateTokenSql = 'UPDATE usuarios SET token_verificacion = ?, token_expiracion = ? WHERE correo = ?';
        db.query(updateTokenSql, [token, tokenExpiration, correo], (err, result) => {
            if (err) {
                console.error('Error al actualizar el token de recuperación:', err);
                return res.status(500).json({ message: 'Error al generar el token de recuperación.' });
            }

            // Configuración del correo electrónico de recuperación
            const mailOptions = {
                from: '20221124@uthh.edu.mx',
                to: correo,
                subject: 'Confirmación de Correo - Gislive Boutique',
                html: `
                    <div style="font-family: Arial, sans-serif; color: #333;">
                        <div style="text-align: center; padding: 20px;">
                            <h1 style="color: #1976d2;">Odontología Carol</h1>
                            <p>¡Hola!</p>
                            <p>Hemos recibido una solicitud para restablecer tu contraseña en <b>Odontología Carol</b>.</p>
                            <p>Si no realizaste esta solicitud, puedes ignorar este correo. De lo contrario, utiliza el siguiente código para restablecer tu contraseña:</p>
                            <div style="padding: 10px; background-color: #f0f0f0; border-radius: 5px; display: inline-block; margin: 20px 0;">
                                <span style="font-size: 24px; font-weight: bold; color: #1976d2;">${token}</span>
                            </div>
                            <p style="color: #d32f2f; font-weight: bold; font-size: 18px;">El token debe ser copiado tal y como está, respetando mayúsculas, minúsculas y guiones.</p>
                            <p><b>Nota:</b> Este código caduca en 15 minutos.</p>
                            <hr style="margin: 20px 0;">
                            <footer>
                                <p>Odontología Carol - Cuidando de tu salud bucal</p>
                                <p>Este es un correo generado automáticamente, por favor no respondas a este mensaje.</p>
                            </footer>
                        </div>
                    </div>
                `,
            };

            // Enviar el correo electrónico
            transporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                    console.error('Error al enviar el correo de recuperación:', err);
                    return res.status(500).json({ message: 'Error al enviar el correo de recuperación.' });
                }
                console.log(`Correo de recuperación enviado correctamente a: ${correo}`);
                res.status(200).json({ message: 'Se ha enviado un enlace de recuperación a tu correo.' });
            });
        });
    });
});

module.exports = router;
