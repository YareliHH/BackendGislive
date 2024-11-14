const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const Registrer = require('./routes/CRUDregistre.js');
const login = require('./routes/CRUDuser.js');
const TerminosYC = require('./routes/CrudTerminosYC.js');
const politicas = require('./routes/CrudPoliticas.js');
const deslinde = require('./routes/CrudDeslinde.js');
const perfil_empresa = require('./routes/PerfiEmpresa.js');
const redesSociales = require('./routes/RedesSociales.js');

const app = express();

// Configuración de CORS para permitir solicitudes desde dominios específicos
app.use(cors({
    origin: [
        'https://gisliveboutique.onrender.com',
        'https://gisliveboutique.isoftuthh.com',
        'https://backendgislive.onrender.com'
    ], // Dominios permitidos
    credentials: true  // Permitir el envío de cookies y credenciales
}));

// Middleware para parsear el cuerpo de las solicitudes en formato JSON
app.use(bodyParser.json());

// Definir las rutas de la API
app.use('/api', Registrer);
app.use('/api', login);
app.use('/api', TerminosYC);
app.use('/api', politicas);
app.use('/api', deslinde);
app.use('/api', perfil_empresa);
app.use('/api', redesSociales);

// Iniciar el servidor en el puerto especificado o en el puerto 3001 por defecto
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});
