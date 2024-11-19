const express = require('express');
const connection = require('../Config/db'); // Asegúrate de que la ruta a tu conexión de base de datos sea correcta
const router = express.Router();

// Ruta para insertar una nueva política de privacidad
router.post('/insert', (req, res) => {
    const { titulo, contenido } = req.body;

    // Verificar la versión más alta actual para asignar una nueva versión
    const selectQuery = 'SELECT MAX(CAST(version AS DECIMAL(5,2))) AS maxVersion FROM politicas_privacidad';

    connection.query(selectQuery, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Error en el servidor al obtener la versión actual');
        }

        // Si no hay versiones, comenzamos con la versión 1.0
        const maxVersion = result[0].maxVersion ? Math.floor(parseFloat(result[0].maxVersion)) + 1 : 1;

        // Desactivar todas las políticas existentes
        const deactivateQuery = 'UPDATE politicas_privacidad SET estado = ? WHERE estado = ?';
        connection.query(deactivateQuery, ['inactivo', 'activo'], (err) => {
            if (err) {
                console.log(err);
                return res.status(500).send('Error en el servidor al desactivar las políticas existentes');
            }

            // Insertar la nueva política con estado activo y la versión calculada
            const insertQuery = 'INSERT INTO politicas_privacidad (titulo, contenido, estado, version) VALUES (?, ?, ?, ?)';
            connection.query(insertQuery, [titulo, contenido, 'activo', maxVersion.toFixed(2)], (err) => {
                if (err) {
                    console.log(err);
                    return res.status(500).send('Error en el servidor al insertar nueva política');
                }
                res.status(200).send(`Política de privacidad insertada con éxito, versión ${maxVersion.toFixed(2)}`);
            });
        });
    });
});


// Ruta para actualizar una política de privacidad
router.put('/update/:id', (req, res) => {
    const { titulo, contenido } = req.body;
    const { id } = req.params;

    // Primero obtenemos la última versión de esta política para calcular la nueva versión
    const selectQuery = 'SELECT MAX(CAST(version AS DECIMAL(5,2))) AS maxVersion FROM politicas_privacidad WHERE id = ?';

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
        const deactivateQuery = 'UPDATE politicas_privacidad SET estado = "inactivo" WHERE id = ?';
        connection.query(deactivateQuery, [id], (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).send('Error al desactivar la versión anterior');
            }

            // Insertar la nueva política con la versión incrementada (decimal)
            const insertQuery = 'INSERT INTO politicas_privacidad (titulo, contenido, estado, version) VALUES (?, ?, ?, ?)';
            connection.query(insertQuery, [titulo, contenido, 'activo', newVersion], (err, result) => {
                if (err) {
                    console.log(err);
                    return res.status(500).send('Error al insertar la nueva versión de la política');
                }
                res.status(200).send(`Política actualizada a la versión ${newVersion}`);
            });
        });
    });
});


// Ruta para eliminar (lógicamente) una política de privacidad
router.put('/deactivate/:id', (req, res) => {
    const { id } = req.params;

    const query = 'UPDATE politicas_privacidad SET estado = ? WHERE id = ?';

    connection.query(query, ['inactivo', id], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Error en el servidor');
        }
        res.status(200).send('Política de privacidad eliminada (lógicamente) con éxito');
    });
});

// Ruta para obtener todas las políticas de privacidad activas
router.get('/getpolitica', (req, res) => {
    const query = 'SELECT * FROM politicas_privacidad';

    connection.query(query, (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Error en el servidor');
        }
        res.status(200).json(results);
    });
});


// Ruta para obtener todas las políticas (activas e inactivas)
router.get('/getAllPoliticas', (req, res) => {
    const query = 'SELECT * FROM politicas_privacidad ORDER BY numero_politica, CAST(version AS DECIMAL(5,2)) ASC';

    connection.query(query, (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Error en el servidor');
        }
        res.status(200).json(results);
    });
});

module.exports = router;
