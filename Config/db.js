const mysql = require('mysql');

const pool = mysql.createPool({
    host: '193.203.166.102',
    user: 'u666156220_yarelih',
    password: 'Yareli1211',
    database: 'u666156220_bdgislive',
    port: 3306,
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,

});

pool.getConnection((err) => {
    if (err) {
        console.error('Error conectando a la base de datos:', err);
    } else {
        console.log('Conectado a la base de datos MySQL');
    }
});

module.exports = pool;
