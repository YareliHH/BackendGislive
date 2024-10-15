const express = require('express');
const router = express.Router();
const connection = require('../Config/db');

router.post('/login', (req, res) => {
    const { user, password } = req.body;

    console.log('Datos recibidos del frontend:', { user, password });  // Verifica lo que llega del frontend

    const query = 'SELECT * FROM registro WHERE user = ?';
    connection.query(query, [user], (err, results) => {
        if (err) {
            console.error('Error en la base de datos:', err);
            return res.status(500).json({ error: 'Error en la base de datos' });
        }

        console.log('Resultados de la consulta:', results);
        if (results.length === 0) {
            console.log('Usuario no encontrado:', user);
            return res.status(401).json({ error: 'Usuario no encontrado' });
        }

        const usuario = results[0];
        console.log('Usuario encontrado en la base de datos:', usuario);

        // Comparar la contraseña correctamente usando el nombre de la columna en mayúscula
        console.log('Comparando contraseñas:', password, usuario.Password);  // Cambia a usuario.Password
        if (password !== usuario.Password) {  // Cambia a usuario.Password
            console.log('Contraseña incorrecta');
            return res.status(401).json({ error: 'Contraseña incorrecta' });
        }

        console.log('Autenticación exitosa');
        res.json({
            user: usuario.User,  // Cambia a usuario.User si es necesario
            tipo: usuario.tipo,
        });
    });
});

module.exports = router;