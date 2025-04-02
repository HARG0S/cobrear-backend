import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connection } from './config/db';
import categoriaRoutes from './routes/categorias.routes';
import pedidosRoutes from './routes/pedidos.routes';
import detallePedidosRoutes from './routes/detalle_pedidos.routes';
import productosRoutes from './routes/productos.routes';
import variantesRoutes from './routes/variantes.routes';
import usuariosRoutes from './routes/usuarios.routes'; 
import authRoutes from './routes/auth.routes'; 
import errorHandler from './middlewares/errorhandler';


dotenv.config();

if (!process.env.DB_HOST || !process.env.DB_USER) {
    console.warn('⚠️ Variables de entorno no cargadas correctamente.');
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas principales
console.log('🧪 authRoutes:', authRoutes);

app.use('/api/auth', authRoutes);                    // Registro y login
app.use('/api/usuarios', usuariosRoutes);            // Gestión de usuarios
app.use('/api/categorias', categoriaRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/detalle-pedidos', detallePedidosRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/variantes', variantesRoutes);

// Middleware global para errores
app.use(errorHandler);

// Inicio del servidor
const startServer = async () => {
try {
    await connection.getConnection();
    console.log('✅ Conexión con la base de datos lista');

    app.listen(PORT, () => {
        console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
    } catch (err: any) {
    console.error('❌ Error en la conexión de base de datos:', err.message);
    process.exit(1);
}
};

startServer();
