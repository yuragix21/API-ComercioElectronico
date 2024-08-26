const cors = require('cors');
const logger = require('../utils/logger');

const allowedOrigins = ['https://example.com', 'https://anotherdomain.com', 'https://w3schools.com'];

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            logger.warn(`CORS policy blocked request from origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type,Authorization'
};

module.exports = cors(corsOptions);