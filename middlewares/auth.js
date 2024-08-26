//const jwt = require('jsonwebtoken');

//const authenticateToken = (req, res, next) => {
//    const authHeader = req.headers['authorization'];
//    const token = authHeader && authHeader.split(' ')[1];

//    if (token == null) return res.sendStatus(401);

//    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
//        if (err) return res.sendStatus(403);
//        req.user = user;
//        next();
//    });
//};

//module.exports = authenticateToken;


const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        return res.status(401).json({ error: 'Forbidden' }); // Mensaje personalizado
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token is invalid or expired' }); // Mensaje personalizado
        }
        req.user = user;
        next();
    });
};

module.exports = authenticateToken;
