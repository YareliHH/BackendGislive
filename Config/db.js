const mysql = require('mysql');

const connection = mysql.createConnection({
    host: '193.203.166.102',
    user: 'u666156220_yarelih',
    password: 'Yareli1211',
    database: 'u666156220_bdgislive' 
});

connection.connect((err) => {
    if (err) {
        console.error('Error conectando a la base de datos:', err);
    } else {
        console.log('Conectado a la base de datos MySQL');
    }
});

module.exports = connection;