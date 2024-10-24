const express = require('express');
const router = express.Router();
const connection = require('../Config/db');


// Obtener todos los registros de Deslinde Legal (Read)
const getDeslindes = (req, res) => {
    const sql = 'SELECT * FROM Deslinde_Legal';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error al obtener los registros de Deslinde Legal:', err);
            return res.status(500).json({ message: "Error al obtener los registros" });
        }
        res.status(200).json(results);
    });
};

// Crear un nuevo registro de Deslinde Legal (Create)
const createDeslinde = (req, res) => {
    const { cliente_nombre, descripcion, fecha_deslinde, estatus } = req.body;
    const sql = `INSERT INTO Deslinde_Legal (cliente_nombre, descripcion, fecha_deslinde, estatus) 
                 VALUES (?, ?, ?, ?)`;
    db.query(sql, [cliente_nombre, descripcion, fecha_deslinde, estatus], (err, result) => {
        if (err) {
            console.error('Error al crear Deslinde Legal:', err);
            return res.status(500).json({ message: "Error al crear el Deslinde Legal" });
        }
        res.status(201).json({ message: 'Deslinde Legal creado exitosamente', id: result.insertId });
    });
};

// Actualizar un registro de Deslinde Legal por ID (Update)
const updateDeslinde = (req, res) => {
    const { id } = req.params;
    const { cliente_nombre, descripcion, fecha_deslinde, estatus } = req.body;
    const sql = `UPDATE Deslinde_Legal 
                 SET cliente_nombre = ?, descripcion = ?, fecha_deslinde = ?, estatus = ? 
                 WHERE id = ?`;
    db.query(sql, [cliente_nombre, descripcion, fecha_deslinde, estatus, id], (err, result) => {
        if (err) {
            console.error('Error al actualizar Deslinde Legal:', err);
            return res.status(500).json({ message: "Error al actualizar el Deslinde Legal" });
        }
        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Deslinde Legal actualizado exitosamente' });
        } else {
            res.status(404).json({ message: 'Deslinde Legal no encontrado' });
        }
    });
};

// Eliminar un registro de Deslinde Legal por ID (Delete)
const deleteDeslinde = (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM Deslinde_Legal WHERE id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Error al eliminar Deslinde Legal:', err);
            return res.status(500).json({ message: "Error al eliminar el Deslinde Legal" });
        }
        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Deslinde Legal eliminado exitosamente' });
        } else {
            res.status(404).json({ message: 'Deslinde Legal no encontrado' });
        }
    });
};

module.exports = { getDeslindes, createDeslinde, updateDeslinde, deleteDeslinde };
