const mysql = require('mysql');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'Yareli',
    password: 'Yareli11',
    database: 'bdgislive' 
});

connection.connect((err) => {
    if (err) {
        console.error('Error conectando a la base de datos:', err);
    } else {
        console.log('Conectado a la base de datos MySQL');
    }
});

module.exports = connection;