// server.js

const express = require('express');
//const https = require('https');//nuevo
//const fs = require('fs');//nuevo

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

//const privateKey = fs.readFileSync('C:/xampp/apache/conf/ssl.key/server.key','utf8');
//const certi = fs.readFileSync('C:/xampp/apache/conf/ssl.crt/server.crt','utf8');
//const credencials={key:privateKey, cert: certi};


// Configuración de CORS para permitir solicitudes desde dominios específicos
app.use(cors({
    origin: 'https://gisliveboutique.onrender.com', // Especifica el dominio del frontend
    credentials: true, // Permitir envío de cookies y credenciales
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Métodos permitidos
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'], // Encabezados permitidos
}));

// Middleware para responder a solicitudes OPTIONS (preflight) para verificación de CORS
app.options('*', cors({
    origin: 'https://gisliveboutique.onrender.com',
    credentials: true,
}));

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

// Iniciar el servidor por https
const PORT = process.env.PORT || 3001;

//////////ANTES
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en el puerto ${PORT}`);
    });

//nuevo
//https.createServer(credencials, app).listen(PORT, () => {
  //  console.log(`Servidor conectado a https en el puerto ${PORT}`);
  //});
  

module.exports = app; // Exporta `app` si necesitas realizar pruebas
