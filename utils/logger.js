const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, colorize } = format;

// Formato personalizado para los logs
const logFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level}]: ${message}`;
});

// Crear el logger con diferentes transportes
const logger = createLogger({
    format: combine(
        timestamp(),
        colorize(),
        logFormat
    ),
    transports: [
        new transports.Console(), // Mostrar en la consola
        new transports.File({ filename: 'logs/combined.log' }), // Guardar en un archivo
        new transports.File({ filename: 'logs/errors.log', level: 'error' }) // Guardar solo errores
    ]
});

module.exports = logger;