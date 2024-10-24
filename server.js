const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); 
const Registrer = require('./routes/CRUDregistre.js'); 
const login = require('./routes/CRUDuser.js'); 

const { getDeslindes, createDeslinde, updateDeslinde, deleteDeslinde } = require('./routes/CrudDeslinde'); // Corregido
const { getPoliticas, createPolitica, updatePolitica, deletePolitica } = require('./routes/CrudPoliticas'); // Corregido
const { getTerminos, createTerminos, updateTerminos, deleteTerminos } = require('./routes/CrudTerminosYC'); // Corregido


const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use('/api', Registrer); 
app.use('/api', login); 

router.post('/recuperar-password', recuperarPassword);
router.post('/cambiar-password', cambiarPassword);

//CRUD Deslinde
router.get('/getDeslindes', getDeslindes);
router.post('/add_deslinde', createDeslinde);
router.put('/edit_deslinde/:id', updateDeslinde);
router.delete('/delete_deslinde/:id', deleteDeslinde);

//CRUD Politicas
router.get('/getPoliticas', getPoliticas);
router.post('/add_politica', createPolitica);
router.put('/edit_politica/:id', updatePolitica);
router.delete('/delete_politica/:id', deletePolitica);

//CRUD Terminos
router.get('/getTerminos', getTerminos);
router.post('/add_termino', createTerminos);
router.put('/edit_termino/:id', updateTerminos);
router.delete('/delete_termino/:id', deleteTerminos);



const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});



module.exports = router;