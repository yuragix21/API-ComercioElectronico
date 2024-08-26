const express = require('express');
const router = express.Router();

const authenticateToken = require('../middlewares/auth');
const ordersController = require('../controllers/ordersController');
const { validateCreateOrder, validateUpdateOrderStatus } = require('../middlewares/validateOrder');

router.post('/orders', authenticateToken, validateCreateOrder, ordersController.createOrder);
router.get('/orders/:orderId', authenticateToken,ordersController.getOrderById);
router.get('/users/:userId/orders', authenticateToken,ordersController.getOrdersByUser);
router.put('/orders/:orderId', authenticateToken,validateUpdateOrderStatus,ordersController.updateOrderStatus);

module.exports = router;