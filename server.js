const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); 
const Registrer = require('./routes/CRUDregistre.js'); // Importa el archivo CRUDregistre.js
const login = require('./routes/CRUDuser.js'); // Importa el archivo CRUDregistre.js
const deslinde = require('./routes/DeslindeLegal.js');

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use('/api', Registrer); 
app.use('/api', login); 
app.use('/api/', deslinde);


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});
