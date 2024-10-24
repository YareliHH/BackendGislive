const express = require('express');
const router = express.Router();
const connection = require('../Config/db');

const getPoliticas = async (req, res) => {
    const sql = "SELECT * FROM politicas"; 
    db.query(sql, (err, result) => {
        if (err) {
            console.error('Error en la consulta:', err);
            return res.status(500).json({ message: "Error en el servidor" });
        }
        return res.json(result);
    });
};

const createPolitica = async (req, res) => {
    const { politica } = req.body; 
    const sql = "INSERT INTO politicas (politica) VALUES (?)"; 
    db.query(sql, [politica], (err, result) => {
        if (err) {
            console.error('Error al crear politicas:', err);
            return res.status(500).json({ message: "Ocurrió un error inesperado" + err });
        }
        return res.json({ success: "politicas agregado correctamente", id: result.insertId });
    });
};

const updatePolitica = async (req, res) => {
    const { id } = req.params; 
    const { politica } = req.body; 

    const sql = "UPDATE politicas SET politica = ? WHERE id = ?";
    db.query(sql, [politica, id], (err, result) => {
        if (err) {
            console.error('Error al actualizar politicas:', err);
            return res.status(500).json({ message: "Error al actualizar politicas" });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "politica no encontrado" });
        }
        return res.json({ id, politica });
    });
};

const deletePolitica = async (req, res) => {
    const id = req.params.id;
    const sql = "DELETE FROM politicas WHERE id = ?";
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Error al eliminar politicas:', err);
            return res.status(500).json({ message: "Ocurrió un error inesperado" + err });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "politicas no encontrado" });
        }
        return res.json({ success: "politicas eliminado correctamente" });
    });
};

module.exports = { updatePolitica, deletePolitica, createPolitica, getPoliticas };