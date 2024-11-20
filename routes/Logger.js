const express = require('express');
const connection = require('../Config/db'); // Asegúrate de que la ruta a tu conexión de base de datos sea correcta
const { createLogger, format, transports } = require('winston');
const TransportStream = require('winston-transport');
const { combine, timestamp, printf } = format;


const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level.toUpperCase()}]: ${message}`;
});

// Crear transporte personalizado que herede de winston-transport
class MySQLTransport extends TransportStream {
  constructor(opts) {
    super(opts);
  }

  log(info, callback) {
    setImmediate(() => this.emit('logged', info));

    const sqlInsert = 'INSERT INTO logs (level, message, timestamp) VALUES (?, ?, ?)';
    const sqlDelete = 'DELETE FROM logs WHERE id IN (SELECT id FROM logs ORDER BY timestamp ASC LIMIT ?)';

    // Inserta el log en la base de datos
    db.query(sqlInsert, [info.level, info.message, new Date()], (err) => {
      if (err) {
        console.error('Error al insertar el log en la base de datos:', err);
        return;
      }

      // Contar el número de registros y eliminar los más antiguos si supera el límite
      const countQuery = 'SELECT COUNT(*) AS count FROM logs';
      db.query(countQuery, (err, results) => {
        if (err) {
          console.error('Error al contar los registros de logs:', err);
          return;
        }

        const count = results[0].count;
        const logLimit = 1000;  // Límite de registros

        if (count > logLimit) {
          // Eliminar los registros más antiguos
          const deleteCount = count - logLimit;
          db.query(sqlDelete, [deleteCount], (err) => {
            if (err) {
              console.error('Error al eliminar los logs más antiguos:', err);
            } else {
              console.log(`${deleteCount} logs antiguos eliminados.`);
            }
          });
        }
      });
    });

    callback();
  }
}

// Configuración del logger
const logger = createLogger({
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: [
    new transports.Console(),  // Log en la consola
    new MySQLTransport()       
  ]
});

module.exports = logger;