const Order = require('../models/Order');

const logger = require('../utils/logger');

logger.info('Logger initialized and working in createOrder');

exports.createOrder = (req, res) => {
    const { userId, products, shippingAddress } = req.body;

    logger.info(`User ${userId} is attempting to create an order`);

    const productIds = products.map(p => p.id_product);

    Order.checkProductsExist(productIds, (err, allProductsExist) => {
        if (err) {
            logger.error(`Error checking products: ${err.message}`);
            return res.status(500).json({ error: err.message });
        }

        if (!allProductsExist) {
            logger.warn(`Some products do not exist for User ${userId}`);
            return res.status(400).json({ error: 'Some products do not exist.' });
        }

        Order.getProductsDetails(productIds, (err, productDetails) => {
            if (err) {
                logger.error(`Error getting product details: ${err.message}`);
                return res.status(500).json({ error: err.message });
            }

            let total = 0;
            const orderItems = products.map(p => {
                const productDetail = productDetails.find(pd => pd.id_product === p.id_product);
                const price = productDetail?.price_product;
                const stock = productDetail?.stock;

                if (price === undefined) {
                    logger.warn(`Product ID ${p.id_product} does not have a valid price.`);
                    return res.status(400).json({ error: `Product ID ${p.id_product} does not have a valid price.` });
                }
                if (stock < p.quantity) {
                    logger.warn(`Insufficient stock for product ID ${p.id_product}.`);
                    return res.status(400).json({ error: `Insufficient stock for product ID ${p.id_product}.` });
                }
                total += price * p.quantity;
                return [null, p.id_product, p.quantity, price];
            });

            Order.createOrder(userId, total, shippingAddress, (err, result) => {
                if (err) {
                    logger.error(`Error creating order: ${err.message}`);
                    return res.status(500).json({ error: err.message });
                }

                const orderId = result.insertId;
                orderItems.forEach(item => item[0] = orderId);

                Order.createOrderItems(orderItems, (err) => {
                    if (err) {
                        logger.error(`Error creating order items: ${err.message}`);
                        return res.status(500).json({ error: err.message });
                    }

                    logger.info(`Order ${orderId} created successfully by User ${userId}`);
                    res.status(201).json({
                        message: 'Order created successfully',
                        id_order: orderId,
                        total: total
                    });
                });
            });
        });
    });
};


exports.getOrderById = (req, res) => {
    const orderId = parseInt(req.params.orderId, 10);
    const requestUserId = req.body.userId;

    if (isNaN(orderId)) {
        return res.status(400).json({ error: 'Invalid order ID' });
    }

    // Obtener el pedido por ID
    Order.getOrderById(orderId, (err, orderResults) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (orderResults.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const order = orderResults[0]; // Asumimos que solo hay un resultado

        // Verificar que el pedido pertenece al usuario que hace la solicitud
        if (order.id_user !== requestUserId) {
            return res.status(403).json({ error: 'Forbidden: You cannot access this order' });
        }

        // Obtener los �tems del pedido
        Order.getOrderItems(orderId, (err, orderItems) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            // Responder con los detalles del pedido y los �tems
            res.status(200).json({
                orderId: order.id_order,
                userId: order.id_user,
                orderDate: order.order_date,
                total: order.total,
                shippingAddress: order.shipping_address,
                status: order.status,
                items: orderItems
            });
        });
    });
};

//Obtener la lista de pedidos segun ID usuario
exports.getOrdersByUser = (req, res) => {
    const userId = parseInt(req.params.userId, 10);
    const { status, page = 1, limit = 10 } = req.query;

    //validando si el Id es incorrecto o si existe
    if (isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
    }


    // Calcular el offset para la paginaci�n
    const offset = (page - 1) * limit;

    //Obtenemos la lista filtrada de pedidos
    Order.getOrdersByUser(userId, status, limit, offset, (err, orders) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (orders.length === 0) {
            return res.status(404).json({ error: 'No orders found for this user' });
        }

        res.status(200).json({
            currentPage: parseInt(page, 10),
            totalOrders: orders.length,
            orders: orders
        });
    });
}

//Actualizar un pedido
exports.updateOrderStatus = (req, res) => {
    const orderId = parseInt(req.params.orderId, 10);
    const { userId, status } = req.body;

    // Loggear el intento de actualizaci�n de estado
    logger.info(`Attempt to update status of order ID ${orderId} by user ID ${userId}`);

    // Validar el ID del pedido
    if (isNaN(orderId)) {
        logger.warn(`Invalid order ID: ${orderId}`);
        return res.status(400).json({ error: 'Invalid order ID' });
    }

    // Verificar que el estado sea v�lido
    const validStatuses = ['pending', 'shipped', 'completed'];
    if (!validStatuses.includes(status)) {
        logger.warn(`Invalid status value: ${status}`);
        return res.status(400).json({ error: 'Invalid status value' });
    }

    // Verificar que el usuario sea administrador
    Order.getUserRole(userId, (err, role) => {
        if (err) {
            logger.error(`Error retrieving role for user ID ${userId}: ${err.message}`);
            return res.status(500).json({ error: err.message });
        }

        if (role !== 'admin') {
            logger.warn(`Unauthorized access attempt by user ID ${userId}`);
            return res.status(403).json({ error: 'Unauthorized access' });
        }

        // Verificar si el pedido existe
        Order.getOrderById(orderId, (err, orderResults) => {
            if (err) {
                logger.error(`Error retrieving order ID ${orderId}: ${err.message}`);
                return res.status(500).json({ error: err.message });
            }

            if (orderResults.length === 0) {
                logger.warn(`Order ID ${orderId} not found`);
                return res.status(404).json({ error: 'Order not found' });
            }

            // Actualizar el estado del pedido
            Order.updateOrderStatus(orderId, status, (err) => {
                if (err) {
                    logger.error(`Error updating order ID ${orderId}: ${err.message}`);
                    return res.status(500).json({ error: err.message });
                }

                logger.info(`Order ID ${orderId} status updated to ${status}`);
                res.status(200).json({ message: 'Order status updated successfully' });
            });
        });
    });
};