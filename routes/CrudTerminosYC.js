const express = require('express');
const router = express.Router();
const connection = require('../Config/db');


router.post('/insert', (req, res) => {
    const { titulo, contenido } = req.body;

    const selectQuery = 'SELECT MAX(CAST(version AS DECIMAL(5,2))) AS maxVersion FROM terminos_condiciones';
    connection.query(selectQuery, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Error en el servidor al obtener la versión actual');
        }

// Si no hay versiones, comenzamos con la versión 1.0
        const maxVersion = result[0].maxVersion ? Math.floor(parseFloat(result[0].maxVersion)) + 1 : 1;

        // Insertar la nueva política con la versión calculada
        const insertQuery = 'INSERT INTO terminos_condiciones (titulo, contenido, estado, version) VALUES (?, ?, ?, ?)';
        connection.query(insertQuery, [titulo, contenido, 'activo', maxVersion.toFixed(2)], (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).send('Error en el servidor al insertar nueva política');
            }
            res.status(200).send(`terminos y condiciones insertada con éxito, versión ${maxVersion.toFixed(2)}`);
        });
    });
});

// Actualizar un término
router.put('/update/:id', (req, res) => {
    const { titulo, contenido } = req.body;
    const { id } = req.params;

    // Primero obtenemos la última versión de esta política para calcular la nueva versión
    const selectQuery = 'SELECT MAX(CAST(version AS DECIMAL(5,2))) AS maxVersion FROM terminos_condiciones WHERE id = ?';

    connection.query(selectQuery, [id], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Error al obtener la versión actual');
        }

        // Obtener la versión más alta de la política y calcular la siguiente versión (decimal)
        const currentVersion = result[0].maxVersion;
        let newVersion;

        if (currentVersion) {
            // Si la versión ya tiene un decimal, simplemente incrementamos la parte decimal
            const versionParts = currentVersion.toString().split('.');
            if (versionParts.length === 1 || versionParts[1] === '00') {
                newVersion = `${versionParts[0]}.1`;
            } else {
                const majorVersion = versionParts[0];
                const minorVersion = parseInt(versionParts[1], 10) + 1;
                newVersion = `${majorVersion}.${minorVersion}`;
            }
        } else {
            // Si no hay versiones anteriores, comenzamos con la versión 1.1
            newVersion = '1.1';
        }
// Desactivar la versión anterior de la política
const deactivateQuery = 'UPDATE terminos_condiciones SET estado = "inactivo" WHERE id = ?';
connection.query(deactivateQuery, [id], (err, result) => {
    if (err) {
        console.log(err);
        return res.status(500).send('Error al desactivar la versión anterior');
    }

    // Insertar la nueva política con la versión incrementada (decimal)
    const insertQuery = 'INSERT INTO terminos_condiciones (titulo, contenido, estado, version) VALUES (?, ?, ?, ?)';
    connection.query(insertQuery, [titulo, contenido, 'activo', newVersion], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Error al insertar la nueva versión de la política');
        }
        res.status(200).send(`termino actualizada a la versión ${newVersion}`);
    });
});
});
});


// Ruta para eliminar (lógicamente) una política de privacidad
router.put('/deactivate/:id', (req, res) => {
const { id } = req.params;

const query = 'UPDATE terminos_condiciones SET estado = ? WHERE id = ?';

connection.query(query, ['inactivo', id], (err, result) => {
if (err) {
    console.log(err);
    return res.status(500).send('Error en el servidor');
}
res.status(200).send('Terminos y condiciones eliminada (lógicamente) con éxito');
});
});

// Ruta para obtener todas las políticas de privacidad activas
router.get('/getterminos', (req, res) => {
const query = 'SELECT * FROM terminos_condiciones WHERE estado = "activo" ORDER BY id';

connection.query(query, (err, results) => {
if (err) {
    console.log(err);
    return res.status(500).send('Error en el servidor');
}
res.status(200).json(results);
});
});


// Ruta para obtener todas las políticas (activas e inactivas)
router.get('/getterminos', (req, res) => {
const query = 'SELECT * FROM terminos_condiciones ORDER BY numero_politica, CAST(version AS DECIMAL(5,2)) ASC';

connection.query(query, (err, results) => {
if (err) {
    console.log(err);
    return res.status(500).send('Error en el servidor');
}
res.status(200).json(results);
});
});

module.exports = router;
