import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connection } from './config/db';

// 🌐 Carga de variables de entorno
dotenv.config();
if (!process.env.DB_HOST || !process.env.DB_USER) {
  console.warn('⚠️ Variables de entorno no cargadas correctamente.');
}

const app = express();
const PORT = process.env.PORT || 3000;

// 🧩 Middlewares globales
app.use(cors());
app.use(express.json());

// 🔗 Importación de rutas
import authRoutes from './routes/auth.routes';
import usuariosRoutes from './routes/usuarios.routes';
import clientesRoutes from './routes/clientes.routes';
import pedidosClienteRoutes from './routes/pedidosCliente';
import pedidosRoutes from './routes/pedidos.routes';
import detallePedidosRoutes from './routes/detalle_pedidos.routes';
import categoriaRoutes from './routes/categorias.routes';
import productosRoutes from './routes/productos.routes';
import variantesRoutes from './routes/variantes.routes';
import devRoutes from './routes/dev.routes'; // ⚠️ Borrar en producción

// 🛣️ Rutas de la API
console.log('✅ Rutas principales cargadas correctamente');

app.use('/api/auth', authRoutes);                          // Login y registro
app.use('/api/usuarios', usuariosRoutes);                  // Usuarios
app.use('/api/clientes', clientesRoutes);                  // Clientes
app.use('/api/pedidos/cliente', pedidosClienteRoutes);     // Pedidos por cliente
app.use('/api/pedidos', pedidosRoutes);                    // Pedidos generales
app.use('/api/detalle-pedidos', detallePedidosRoutes);     // Detalle de pedidos
app.use('/api/categorias', categoriaRoutes);               // Categorías
app.use('/api/productos', productosRoutes);                // Productos
app.use('/api/variantes', variantesRoutes);                // Variantes

app.use('/api/dev', devRoutes); // ⚠️ Ruta temporal (eliminar para producción)

// 🧯 Middleware global para manejo de errores
import errorHandler from './middlewares/errorhandler';
app.use(errorHandler);

// 🚀 Inicio del servidor
const startServer = async () => {
  try {
    await connection.getConnection();
    console.log('✅ Conexión con la base de datos lista');

    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (err: any) {
    console.error('❌ Error en la conexión de base de datos:', err.message);
    process.exit(1);
  }
};

startServer();
