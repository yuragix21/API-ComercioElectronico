// models/Order.js
const db = require('../configBD/config');

const Order = {
    // Verificar si todos los productos existen
    checkProductsExist: (productIds, callback) => {
        const query = `SELECT id_product FROM products WHERE id_product IN (?)`;
        db.query(query, [productIds], (err, results) => {
            if (err) return callback(err);
            const foundProductIds = results.map(result => result.id_product);
            const allProductsExist = productIds.every(id => foundProductIds.includes(id));
            callback(null, allProductsExist);
        });
    },

    getProductsDetails: (productIds, callback) => {
        const query = 'SELECT * FROM products WHERE id_product IN (?)';
        db.query(query, [productIds], (err, results) => {
            if (err) {
                return callback(err);
            }
            callback(null, results); // Asegúrate de que results es un array
        });
    },

    // Crear un pedido
    createOrder: (userId, total, shippingAddress, callback) => {
        const query = `INSERT INTO orders (id_user, total, shipping_address, status) VALUES (?, ?, ?, ?)`;
        const values = [userId, total, shippingAddress, 'pending'];
        db.query(query, values, callback);
    },

    // Crear los items del pedido
    createOrderItems: (orderItems, callback) => {
        const query = `INSERT INTO order_items (id_order, id_product, quantity, price) VALUES ?`;
        db.query(query, [orderItems], callback);
    },


    getOrderById: (orderId, callback) => {
        const query = 'SELECT * FROM orders WHERE id_order = ?';
        db.query(query, [orderId], (err, results) => {
            if (err) {
                return callback(err);
            }
            callback(null, results);
        });
    },

    getOrderItems: (orderId, callback) => {
        const query = 'SELECT * FROM order_items WHERE id_order = ?';
        db.query(query, [orderId], (err, results) => {
            if (err) {
                return callback(err);
            }
            callback(null, results);
        });
    },

    //Listar pedidos por id de usuario
    getOrdersByUser:  (userId, status, limit, offset, callback) => {
        let query = 'SELECT * from orders WHERE id_user = ?';
        const params = [userId];

        //Filtro por estado
        if (status) {
            query += ' AND status = ?';
            params.push(status);
        }

        //Paginacion
        query += ' LIMIT ? OFFSET ?';
        params.push(parseInt(limit, 10), parseInt(offset, 10));

        db.query(query, params, (err, results) => {
            if (err) {
                return callback(err);
            }
            callback(null, results);
        });
    },

    updateOrderStatus: (orderId, status, callback) => {
        const query = 'UPDATE orders SET status = ? WHERE id_order = ?';
        db.query(query, [status, orderId], (err, results) => {
            if (err) {
                return callback(err);
            }
            callback(null, results);
        });
    },


    getUserRole: (userId, callback) => {
        const query = `
        SELECT roles.role_name 
        FROM user_roles 
        JOIN roles ON user_roles.id_role = roles.id_role 
        WHERE user_roles.id_user = ?
    `;
        db.query(query, [userId], (err, results) => {
            if (err) {
                return callback(err);
            }
            if (results.length === 0) {
                return callback(null, null); // Usuario no encontrado o sin rol
            }
            // Asumimos que un usuario puede tener múltiples roles, pero retornamos el primero
            callback(null, results[0].role_name);
        });
    }
};

module.exports = Order;
