const express = require('express');
const connection = require('../Config/db'); 
const router = express.Router();


function validateUrl(url) {
    const regex = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,6}(\/[a-zA-Z0-9-]*)*\/?$/;
    return regex.test(url);
}


// Endpoint para obtener todas las redes sociales
router.get('/obtenerredes', (req, res) => {
    const query = `SELECT * FROM redes_sociales ORDER BY fecha_creacion DESC`;
    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error en el servidor al obtener redes sociales');
        }
        res.status(200).json(results);
    });
});

// Endpoint para agregar una nueva red social
router.post('/nuevo', (req, res) => {
    const { nombre_red, url } = req.body;

    if (!nombre_red || !url || !validateUrl(url)) {
        return res.status(400).send('Todos los campos son obligatorios y el URL debe ser válido');
    }

    const query = `INSERT INTO redes_sociales (nombre_red, url) VALUES (?, ?)`;
    db.query(query, [nombre_red, url], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error en el servidor al agregar red social');
        }
        res.status(201).send({ id: result.insertId, nombre_red, url });
    });
});

// Endpoint para editar una red social
router.put('/editar/:id', (req, res) => {
    const { id } = req.params;
    const { nombre_red, url } = req.body;

    if (!nombre_red || !url || !validateUrl(url)) {
        return res.status(400).send('Todos los campos son obligatorios y el URL debe ser válido');
    }

    const query = `UPDATE redes_sociales SET nombre_red = ?, url = ? WHERE id = ?`;
    db.query(query, [nombre_red, url, id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error en el servidor al actualizar red social');
        }
        if (result.affectedRows === 0) {
            return res.status(404).send('Red social no encontrada');
        }
        res.status(200).send('Red social actualizada');
    });
});

// Endpoint para eliminar una red social
router.delete('/eliminar/:id', (req, res) => {
    const { id } = req.params;

    const query = `DELETE FROM redes_sociales WHERE id = ?`;
    db.query(query, [id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error en el servidor al eliminar red social');
        }
        if (result.affectedRows === 0) {
            return res.status(404).send('Red social no encontrada');
        }
        res.status(200).send('Red social eliminada');
    });
});
// Endpoint para obtener todas las redes sociales
router.get('/sociales', (req, res) => {
    const sql = 'SELECT * FROM redes_sociales';
    db.query(sql, (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Error al obtener las redes sociales.' });
      }
      res.status(200).json(result);
    });
  });
  

module.exports = router; 
