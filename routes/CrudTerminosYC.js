const express = require('express');
const router = express.Router();
const connection = require('../Config/db');


router.post('/api/termiCondicion/insert', (req, res) => {
    const { titulo, contenido, fecha_vigencia, version, eliminado, vigente } = req.body;
    const query = `INSERT INTO terminos_condiciones (titulo, contenido, fecha_vigencia, version, eliminado, vigente)
                   VALUES (?, ?, ?, ?, ?, ?)`;

    db.query(query, [titulo, contenido, fecha_vigencia, version, eliminado, vigente], (err, result) => {
        if (err) {
            console.error('Error al insertar término: ', err);
            return res.status(500).json({ message: 'Error al insertar término' });
        }
        res.status(201).json({ message: 'Término insertado con éxito', id: result.insertId });
    });
});

// Obtener todos los términos
router.get('/api/termiCondicion/getterminos', (req, res) => {
    const query = 'SELECT * FROM terminos_condiciones';

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener términos: ', err);
            return res.status(500).json({ message: 'Error al obtener términos' });
        }
        res.status(200).json(results);
    });
});

// Actualizar un término
router.put('/api/termiCondicion/update/:id', (req, res) => {
    const { id } = req.params;
    const { titulo, contenido, fecha_vigencia, version, eliminado, vigente } = req.body;
    const query = `UPDATE terminos_condiciones SET 
                   titulo = ?, contenido = ?, fecha_vigencia = ?, version = ?, eliminado = ?, vigente = ?
                   WHERE id = ?`;

    db.query(query, [titulo, contenido, fecha_vigencia, version, eliminado, vigente, id], (err, result) => {
        if (err) {
            console.error('Error al actualizar término: ', err);
            return res.status(500).json({ message: 'Error al actualizar término' });
        }
        res.status(200).json({ message: 'Término actualizado con éxito' });
    });
});

// Eliminar un término
router.delete('/api/termiCondicion/delete/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM terminos_condiciones WHERE id = ?';

    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error al eliminar término: ', err);
            return res.status(500).json({ message: 'Error al eliminar término' });
        }
        res.status(200).json({ message: 'Término eliminado con éxito' });
    });
});
module.exports = router