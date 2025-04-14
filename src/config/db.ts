import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

console.log('Conectando a la base de datos...');
console.log('Host:', process.env.DB_HOST);
console.log('Usuario:', process.env.DB_USER);
console.log('Base de datos:', process.env.DB_NAME);

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || 'cobrear3030',
    database: process.env.DB_NAME || 'mi_tienda',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

pool.getConnection()
    .then(() => console.log(' Conexión a la base de datos establecida correctamente.'))
    .catch((err) => {
        console.error(' Error al conectar con la base de datos:', err.message);
        process.exit(1); 
    });

export const connection = pool;
