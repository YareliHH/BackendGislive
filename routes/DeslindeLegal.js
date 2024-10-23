const express = require('express');
const router = express.Router();
const connection = require('../Config/db');
const bodyParser = require('body-parser');

router.use(bodyParser.json());

// Crear un nuevo registro de Deslinde Legal (Create)
router.post('/deslinde', (req, res) => {
    const { cliente_nombre, descripcion, fecha_deslinde, estatus } = req.body;
    const sql = `INSERT INTO Deslinde_Legal (cliente_nombre, descripcion, fecha_deslinde, estatus) 
                 VALUES (?, ?, ?, ?)`;

    db.query(sql, [cliente_nombre, descripcion, fecha_deslinde, estatus], (err, result) => {
        if (err) throw err;
        res.send({ message: 'Deslinde Legal creado exitosamente', id: result.insertId });
    });
});

// Obtener todos los registros de Deslinde Legal (Read)
router.get('/deslinde', (req, res) => {
    const sql = 'SELECT * FROM Deslinde_Legal';

    db.query(sql, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

// Obtener un solo registro de Deslinde Legal por ID (Read)
router.get('/deslinde/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT * FROM Deslinde_Legal WHERE id = ?';

    db.query(sql, [id], (err, result) => {
        if (err) throw err;
        if (result.length > 0) {
            res.json(result[0]);
        } else {
            res.status(404).send({ message: 'Deslinde Legal no encontrado' });
        }
    });
});

// Actualizar un registro de Deslinde Legal por ID (Update)
router.put('/deslinde/:id', (req, res) => {
    const { id } = req.params;
    const { cliente_nombre, descripcion, fecha_deslinde, estatus } = req.body;
    const sql = `UPDATE Deslinde_Legal 
                 SET cliente_nombre = ?, descripcion = ?, fecha_deslinde = ?, estatus = ? 
                 WHERE id = ?`;

    db.query(sql, [cliente_nombre, descripcion, fecha_deslinde, estatus, id], (err, result) => {
        if (err) throw err;
        if (result.affectedRows > 0) {
            res.send({ message: 'Deslinde Legal actualizado exitosamente' });
        } else {
            res.status(404).send({ message: 'Deslinde Legal no encontrado' });
        }
    });
});
bbjdhcbhcbchfh
// Eliminar un registro de Deslinde Legal por ID (Delete)
router.delete('/deslinde/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM Deslinde_Legal WHERE id = ?';

    db.query(sql, [id], (err, result) => {
        if (err) throw err;
        if (result.affectedRows > 0) {
            res.send({ message: 'Deslinde Legal eliminado exitosamente' });
        } else {
            res.status(404).send({ message: 'Deslinde Legal no encontrado' });
        }
    });
});

module.exports = router;