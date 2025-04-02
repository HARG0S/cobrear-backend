# Backend - Sistema de Ventas (CobreAr)

Este backend está diseñado para gestionar pedidos de clientes con y sin cuenta. Permite registrar productos, categorías, variantes, usuarios y pedidos personalizados que pueden ser enviados al vendedor mediante una integración con WhatsApp. Forma parte de un proyecto fullstack orientado a la venta de materiales para refrigeración.

---

## Tecnologías utilizadas

Este backend fue desarrollado con las siguientes herramientas y librerías:

- Node.js + Express
- TypeScript
- MySQL + MySQL2
- Dotenv
- CORS
- JWT (autenticación de usuarios)
- Bcrypt (encriptación de contraseñas)
- Postman / Thunder Client (para pruebas locales)



## Estructura del proyecto backend

La siguiente estructura representa cómo está organizado el backend del sistema. Cada carpeta contiene archivos relacionados con una funcionalidad específica del servidor:

```plaintext
backend/
├── src/
│   ├── config/
│   │   └── db.ts
│   ├── middlewares/
│   │   ├── errorHandler.ts
│   │   ├── validateAuth.ts
│   │   ├── validateCategoria.ts
│   │   └── validateEntity.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── categorias.routes.ts
│   │   ├── detalle_pedidos.routes.ts
│   │   ├── pedidos.routes.ts
│   │   ├── productos.routes.ts
│   │   ├── usuarios.routes.ts
│   │   └── variantes.routes.ts
│   └── types/
│       ├── handlers/
│       │   └── customhandler.ts
│       └── entities/
│           ├── categoria.ts
│           ├── cliente.ts
│           ├── detallePedido.ts
│           ├── pedido.ts
│           ├── producto.ts
│           ├── serverresponse.ts
│           ├── usuario.ts
│           └── varianteproducto.ts
├── index.ts
├── package.json
├── tsconfig.json
└── .env
```

_____________________________________________________________________________________________________

## Instalacion y configuracion
```bash
git clone https://github.com/tu_usuario/proyecto.git
cd bakend
npm install
npx tsc
npm run dev
```


## Configurá las variables de entorno en un archivo .env como el siguiente:

```bash
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_clave
DB_NAME=mi_tienda
JWT_SECRET=miclaveultrasecreta
```
______________________________________________________________________________________________________

## Base de datos:
El backend está conectado a una base de datos MySQL y trabaja con las siguientes tablas:

- productos

- categorias

- variantes_productos

- usuarios

- clientes

- pedidos

- detalle_pedidos

Estas tablas permiten una estructura completa para soportar pedidos detallados con información asociada a productos, clientes y variantes.

______________________________________________________________________________________________________

## Rutas disponibles:

A continuación, se listan las rutas implementadas y su uso:


## PRODUCTOS :
GET     /productos     → Obtener todos los productos
POST    /productos     → Agregar un nuevo producto

## CATEGORIAS :
GET     /categorias    → Obtener todas las categorías
POST    /categorias    → Agregar una nueva categoría
DELETE  /categorias/:id→ Eliminar una categoría por ID

## USUARIOS :
POST    /usuarios             → Registrar un nuevo usuario
GET     /usuarios/perfil      → Obtener el perfil del usuario autenticado

## AUTH :
POST    /auth/register       → Registrar usuario con hash de contraseña
POST    /auth/login          → Iniciar sesión y obtener token JWT


## PEDIDOS :
GET     /pedidos/mis-pedidos     → Historial de pedidos del cliente autenticado (rol cliente)  
POST    /pedidos                 → Crear un nuevo pedido  
PATCH   /pedidos/cancelar/:id    → Cancelar un pedido (rol vendedor)  
PATCH   /pedidos/vender/:id      → Confirmar un pedido como vendido (rol vendedor)  
DELETE  /pedidos/:id             → Eliminar un pedido en estado pendiente (rol vendedor)

## DETALLE PEDIDOS :
GET     /detalle_pedidos       → Obtener todos los detalles de pedidos
POST    /detalle_pedidos       → Agregar productos a un pedido
DELETE  /detalle_pedidos/:id   → Eliminar un producto del pedido


## VARIANTES DE PRODUCTO :
GET     /variantes     → Obtener todas las variantes de productos
POST    /variantes     → Agregar una nueva variante de producto



Ejemplo de cuerpo de pedido (POST /pedidos)
Este es un ejemplo de cómo debe enviarse un pedido desde el frontend al backend. El sistema acepta tanto pedidos anónimos (sin cliente_id) como pedidos asociados a un cliente registrado.

```bash
{
  "productos": [
    { "id": "AIS001", "cantidad": 2 },
    { "id": "CIN001", "cantidad": 1 }
  ],
  "telefono": "1122334455",
  "nombre_cliente_manual": "Pedro",
  "metodo_pago": "Transferencia",
  "con_factura": true,
  "tipo_comprobante": "A"
}

```

______________________________________________________________________________________________________

## Validaciones y seguridad
El backend incluye medidas para proteger la integridad de los datos y validar operaciones:

- Validación de campos por tipo de entidad (validateEntity)

- Hash de contraseñas con bcrypt (al registrar un usuario)

- Login con verificación de contraseña

- Generación de token JWT

- Middleware validateAuth para proteger rutas sensibles

- Manejo centralizado de errores (errorHandler)

- Autorización basada en roles: ciertas rutas solo son accesibles para usuarios con rol vendedor o cliente.

______________________________________________________________________________________________________

## Flujo previsto e integración
Este backend se integra con un frontend en React.js. El flujo principal contempla:

- Clientes con cuenta que pueden iniciar sesión, ver historial de pedidos y su perfil

- Clientes sin cuenta que realizan pedidos proporcionando datos mínimos

- Todos los pedidos se envían automáticamente al vendedor vía WhatsApp

- El vendedor responde con precios, métodos de pago y genera comprobantes


______________________________________________________________________________________________________

## Estados posibles de los pedidos

La tabla pedidos incluye un campo llamado estado, que representa el estado actual del pedido. Este campo permite al sistema y al vendedor gestionar el ciclo de vida del pedido de manera clara y trazable.

Los valores posibles del campo estado son:

## PENDIENTE:
Estado inicial por defecto cuando el cliente realiza un pedido. Significa que el pedido aún no fue procesado ni confirmado por el vendedor.

## CONFIRMADO:
Indica que el pedido fue procesado y concretado por el vendedor. Se asume que ya fue abonado o se encuentra en proceso de entrega o retiro.

## CANCELADO:
Significa que el pedido fue anulado. Puede ocurrir por diversas razones (desacuerdo con el precio, error del cliente, falta de stock, etc.). Solo un vendedor autenticado puede ejecutar esta acción, y el sistema registra automáticamente quién lo canceló y cuándo (cancelado_por y fecha_cancelacion).

Estos estados permiten mantener la trazabilidad de los pedidos sin eliminar información crítica de la base de datos, evitando conflictos o fraudes.

______________________________________________________________________________________________________

## Estado de despliegue
El backend funciona correctamente en entorno local y está preparado para ser desplegado en servicios como Render o Railway.

______________________________________________________________________________________________________

## Testing
Las rutas fueron testeadas exitosamente con Postman y Thunder Client.

Autor
Ignacio Nicolás Aballay
Trabajo Final Fullstack - UTN 2025