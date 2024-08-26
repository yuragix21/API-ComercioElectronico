const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const db = require('../configBD/config'); // Ajusta la ruta a tu configuración de base de datos

const logger = require('../utils/logger');

// Ruta de registro
router.post('/register', async (req, res) => {
    const { name, email, password, address } = req.body;

    // Loggear el intento de registro
    logger.info(`Attempt to register with email: ${email}`);

    try {
        // Hashear la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Guardar el usuario en la base de datos
        const query = `INSERT INTO users (name, email, password, address) VALUES (?, ?, ?, ?)`;
        db.query(query, [name, email, hashedPassword, address], (err, results) => {
            if (err) {
                logger.error(`Error registering user with email: ${email} - ${err.message}`);
                return res.status(500).json({ error: err.message });
            }
            logger.info(`User registered successfully with email: ${email}`);
            res.status(201).json({ message: 'User registered successfully' });
        });
    } catch (error) {
        logger.error(`Error registering user with email: ${email} - ${error.message}`);
        res.status(500).json({ error: 'Error registering user' });
    }
});

// Ruta de autenticación
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Loggear el intento de inicio de sesión
    logger.info(`Attempt to login with email: ${email}`);

    const query = `SELECT * FROM users WHERE email = ?`;
    db.query(query, [email], async (err, results) => {
        if (err) {
            logger.error(`Error during login for email: ${email} - ${err.message}`);
            return res.status(500).json({ error: err.message });
        }
        if (results.length === 0) {
            logger.warn(`Login attempt with invalid email: ${email}`);
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const user = results[0];
        try {
            if (await bcrypt.compare(password, user.password)) {
                // Generar un token JWT
                const token = jwt.sign({ id: user.id_user }, process.env.JWT_SECRET, { expiresIn: '1h' });
                logger.info(`User logged in successfully with email: ${email}`);
                res.json({ token });
            } else {
                logger.warn(`Login attempt with incorrect password for email: ${email}`);
                res.status(400).json({ error: 'Invalid credentials' });
            }
        } catch (error) {
            logger.error(`Error during login for email: ${email} - ${error.message}`);
            res.status(500).json({ error: 'Error logging in' });
        }
    });
});

module.exports = router;
