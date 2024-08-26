# API de Gesti�n de Pedidos

## Requisitos
- Node.js v22.1.0 o superior\
- Mysql

## Configuraci�n de variables de entorno
PORT=3000
HOST=localhost
USER=root
PASSWORD=Oso.2023
DATABASE=metro
JWT_SECRET=diosito

## Instalaci�n 
Ejecuta el siguiente comando para instalar las dependencias

npm install

## Ejecuci�n del servidor

npm start

se utlizo nodemon para el inicio y actualizaci�n en tiempo real del servidor.

## Uso de la API

Registro de usuario
POST `/auth/register`

body
{
   "name": "John Doe",
   "email": "john@example.com",
   "password": "password123",
   "address": "123 Main St"
}

response
{
   "message": "User registered successfully"
}


Inicio sesi�n de usuario
POST `/auth/login`

body
{
   "email": "john@example.com",
   "password": "password123"
}

response
{
   "token": "token"
}



Crear Pedido
POST `/metro/orders`

body
{
   "userId": 1,
   "products": [
       {"id_product": 101, "quantity": 2},
       {"id_product": 102, "quantity": 1}
   ],
   "shippingAddress": "456 Elm St"
}

response
{
   "message": "Order created successfully",
   "id_order": 38,
   "total": 10.9
}



Obtener una orden segun el id del usuario
GET `/metro/orders/:orderId`

body
{
   "userId": 1
}

response
{
   "orderId": 8,
   "userId": 1,
   "orderDate": "2024-08-24T01:29:21.000Z",
   "total": "3.25",
   "shippingAddress": "123 Main St, Anytown, USA",
   "status": "pending",
   "items": [
       {
           "id_order_item": 11,
           "id_order": 8,
           "id_product": 1,
           "quantity": 2,
           "price": "1.20"
       },
       {
          "id_order_item": 12,
           "id_order": 8,
           "id_product": 2,
           "quantity": 1,
           "price": "0.85"
       }
   ]
}




Obtener todas las ordenes de un usuario
GET `metro/users/:userId/orders`

params
-status('pending', 'shipped', 'completed')
-page(cuantas paginas se listaran)
-limit(cual es el maximo de paginas listadas)

response
{
   "currentPage": 1,
   "totalOrders": 3,
   "orders": [
       {
           "id_order": 3,
           "id_user": 1,
           "order_date": "2024-08-24T01:14:55.000Z",
           "total": "40.00",
           "shipping_address": "123 Main St, Anytown, USA",
           "status": "pending"
       },
       {
           "id_order": 4,
           "id_user": 1,
           "order_date": "2024-08-24T01:15:32.000Z",
           "total": "40.00",
           "shipping_address": "123 Main St, Anytown, USA",
           "status": "pending"
       },
       {
           "id_order": 5,
           "id_user": 1,
           "order_date": "2024-08-24T01:17:45.000Z",
           "total": "40.00",
           "shipping_address": "123 Main St, Anytown, USA",
           "status": "pending"
       }
   ]
}



Actualizar el estado de un pedido(solo admin)
PUT `metro/orders/:orderId`

body
{
    "userId": 3,
    "status": "completed"
}

response
{
   "message": "Order status updated successfully"
}

En esta petici�n se incluye userId porque se v�lida si el usuario es admin o no.




## Medidas de seguridad implementadas
-JWT
-Encryptado de password
-Sanitizacion
-Validaci�n de los datos(para protegerse contra las inyecciones SQL y XSS)
-Cors(para permitir solicitudes desde dominios especificos)
