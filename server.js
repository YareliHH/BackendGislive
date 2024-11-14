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
    ],
    credentials: true
}));

// Middleware para asegurar que las solicitudes OPTIONS obtienen una respuesta de CORS
app.options('*', cors({
    origin: [
        'https://gisliveboutique.onrender.com',
        'https://gisliveboutique.isoftuthh.com',
        'https://backendgislive.onrender.com'
    ],
    credentials: true
}));

// Middleware de prueba para ver el comportamiento de CORS
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*"); // Permitir todas las solicitudes (solo para diagnóstico)
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    next();
});

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
