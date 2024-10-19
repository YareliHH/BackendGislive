const express = require('express');
const router = express.Router();
const db = require('../Config/db'); // Conexión a la base de datos desde db.js

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

    // Consulta SQL para insertar los datos en la tabla 'usuarios'
    const query = `
        INSERT INTO usuarios (nombre, apellido_paterno, apellido_materno, correo, telefono, password, tipo, estado)
        VALUES (?, ?, ?, ?, ?, ?, 'usuario', 'activo')`;

    // Ejecución de la consulta
    db.query(query, [nombre, apellidoPaterno, apellidoMaterno, correo, telefono || null, password], (err, result) => {
        if (err) {
            console.error('Error al insertar usuario en la base de datos:', err);
            return res.status(500).json({ message: 'Error al registrar el usuario' });
        }

        // Respuesta exitosa si se insertaron los datos
        res.status(201).json({ message: 'Usuario registrado exitosamente' });
    });
});

module.exports = router;
