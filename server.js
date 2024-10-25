const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); 
const Registrer = require('./routes/CRUDregistre.js'); 
const login = require('./routes/CRUDuser.js');  
const TerminosYC = require('./routes/CrudTerminosYC.js'); 
const politicas = require('./routes/CrudPoliticas.js');
const deslinde = require('./routes/CrudDeslinde.js');
const perfil_empresa=require('./routes/PerfiEmpresa.js');
const redesSociales =require('./routes/RedesSociales.js');



const app = express();
const router = express.Router(); // Asegúrate de definir el router


app.use(cors());
app.use(bodyParser.json());

app.use('/api', Registrer); 
app.use('/api', login);
app.use('/api', TerminosYC);
app.use('/api', TerminosYC);
app.use('/api', politicas);
app.use('/api', deslinde); 
app.use('/api/',perfil_empresa);
app.use('/api/',redesSociales);




const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});



module.exports = router;


