const express = require('express');
const https = require('https');
const fs = require('fs');
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

const privateKey = fs.readFileSync('/etc/ssl/private/localhost.key','utf8');
const certificate = fs.readFileSync('/etc/ssl/certs/localhost.crt','utf8');
const credentials = { key: privateKey, cert: certificate };

// Configuración de CORS
const corsOptions = {
    origin: (origin, callback) => {
        console.log('Origin:', origin); // Registra el origen de cada solicitud
        const allowedOrigins = [           
            'https://localhost'];
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.error('CORS Error: Origen no permitido ->', origin);
            callback(new Error('No permitido por CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));

// Manejo adecuado de preflight requests (OPTIONS)
app.options('*', cors(corsOptions));

// Middleware para JSON
app.use(bodyParser.json());

// Rutas de la API
app.use('/api', Registrer); 
app.use('/api', login);
app.use('/api', TerminosYC);
app.use('/api', politicas);
app.use('/api', deslinde); 
app.use('/api', perfil_empresa);
app.use('/api', redesSociales);
app.use('/api', reportes);

// Iniciar el servidor por HTTPS
const PORT = process.env.PORT || 3001;
https.createServer(credentials, app).listen(PORT, () => {
    console.log(Servidor corriendo con HTTPS en el puerto ${PORT});
});

module.exports = app

