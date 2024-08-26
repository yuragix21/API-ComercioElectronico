const { body, validationResult } = require('express-validator');

// Middleware para validar y sanitizar todos los datos al crear un pedido
const validateCreateOrder = [
    body('userId').isInt({ gt: 0 }).withMessage('User ID must be a positive integer').toInt(),
    body('products').isArray().withMessage('Products must be an array'),
    body('products.*.id_product').isInt({ gt: 0 }).withMessage('Product ID must be a positive integer').toInt(),
    body('products.*.quantity').isInt({ gt: 0 }).withMessage('Quantity must be a positive integer').toInt(),
    body('shippingAddress').isString().notEmpty().withMessage('Shipping address must be provided').trim().escape(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

const validateUpdateOrderStatus = [
    body('userId').isInt({ gt: 0 }).withMessage('User ID must be a positive integer').toInt(),
    body('status').isIn(['pending', 'shipped', 'completed']).withMessage('Invalid status value').trim().escape(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

module.exports = {
    validateCreateOrder,
    validateUpdateOrderStatus
};
