const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); 
const Registrer = require('./routes/CRUDregistre.js'); // Importa el archivo CRUDregistre.js
const login = require('./routes/CRUDuser.js'); // Importa el archivo CRUDregistre.js

const app = express();

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
  }));
app.use(bodyParser.json());

app.use('/api', Registrer); 
app.use('/api', login); 

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});
