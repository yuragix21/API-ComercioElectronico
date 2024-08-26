module.exports = (err, req, res, next) => {
    if (err && err.message === 'Not allowed by CORS') {
        res.status(403).json({ error: 'CORS policy blocked your request' });
    } else {
        next(err);
    }
};