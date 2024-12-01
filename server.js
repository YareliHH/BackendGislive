// server.js

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
const reportes = require('./routes/Reportes.js');

const app = express();

// Configuración de CORS para permitir solicitudes desde múltiples dominios
const allowedOrigins = [
    'https://gisliveboutique.onrender.com',
    'https://localhost',
    'https://localhost:3001'
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true); // Permitir el origen
        } else {
            callback(new Error('No permitido por CORS')); // Rechazar el origen
        }
    },
    credentials: true, // Permitir envío de cookies y credenciales
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Métodos permitidos
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'], // Encabezados permitidos
}));

// Middleware para responder a solicitudes OPTIONS (preflight) para verificación de CORS
app.options('*', cors());

// Middleware para analizar JSON en el cuerpo de las solicitudes
app.use(bodyParser.json());

// Definir las rutas de la API
app.use('/api', Registrer); 
app.use('/api', login);
app.use('/api', TerminosYC);
app.use('/api', politicas);
app.use('/api', deslinde); 
app.use('/api', perfil_empresa);
app.use('/api', redesSociales);
app.use('/api', reportes);

// Iniciar el servidor
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});

module.exports = app;
