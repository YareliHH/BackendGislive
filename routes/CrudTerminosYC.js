const express = require('express');
const router = express.Router();
const connection = require('../Config/db');


// Obtener todos los registros de Términos y Condiciones (Read)
const getTerminos = (req, res) => {
    const sql = 'SELECT * FROM Terminos_Condiciones';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error al obtener los términos y condiciones:', err);
            return res.status(500).json({ message: "Error al obtener los términos y condiciones" });
        }
        res.status(200).json(results);
    });
};

// Crear un nuevo registro de Términos y Condiciones (Create)
const createTerminos = (req, res) => {
    const { descripcion } = req.body;
    const sql = `INSERT INTO Terminos_Condiciones (descripcion) VALUES (?)`;
    db.query(sql, [descripcion], (err, result) => {
        if (err) {
            console.error('Error al crear los términos y condiciones:', err);
            return res.status(500).json({ message: "Error al crear los términos y condiciones" });
        }
        res.status(201).json({ message: 'Términos y Condiciones creados exitosamente', id: result.insertId });
    });
};

// Actualizar un registro de Términos y Condiciones por ID (Update)
const updateTerminos = (req, res) => {
    const { id } = req.params;
    const { descripcion } = req.body;
    const sql = `UPDATE Terminos_Condiciones SET descripcion = ? WHERE id = ?`;
    db.query(sql, [descripcion, id], (err, result) => {
        if (err) {
            console.error('Error al actualizar los términos y condiciones:', err);
            return res.status(500).json({ message: "Error al actualizar los términos y condiciones" });
        }
        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Términos y Condiciones actualizados exitosamente' });
        } else {
            res.status(404).json({ message: 'Términos y Condiciones no encontrados' });
        }
    });
};

// Eliminar un registro de Términos y Condiciones por ID (Delete)
const deleteTerminos = (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM Terminos_Condiciones WHERE id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Error al eliminar los términos y condiciones:', err);
            return res.status(500).json({ message: "Error al eliminar los términos y condiciones" });
        }
        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Términos y Condiciones eliminados exitosamente' });
        } else {
            res.status(404).json({ message: 'Términos y Condiciones no encontrados' });
        }
    });
};

module.exports = { getTerminos, createTerminos, updateTerminos, deleteTerminos };
