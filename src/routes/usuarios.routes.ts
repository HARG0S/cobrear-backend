import { Router } from 'express';
import { connection } from '../config/db';
import { Usuario } from '../types/entities/usuario';
import { CustomHandler } from '../types/handlers/customhandler';
import { validateEntity } from '../middlewares/validateentity';
import { validateAuth } from '../middlewares/validate-auth';
import bcrypt from 'bcrypt'; 

const router = Router();

// GET: Obtener todos los usuarios
const getUsuarios: CustomHandler = async (_req, res) => {
  try {
    const [rows] = await connection.query('SELECT * FROM usuarios');
    res.json({ data: rows as Usuario[] });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

router.get('/', getUsuarios);

// POST: Crear un nuevo usuario cliente (con datos extendidos)
const postUsuario: CustomHandler = async (req, res) => {
  const {
    username,
    email,
    password,
    rol,
    nombre,
    telefono,
    direccion,
    identificacion,
    tipo_cliente
  } = req.body;

  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // ✅ Insertar en clientes (con tipo_cliente)
    const [clienteResult]: any = await connection.execute(
      `INSERT INTO clientes (nombre, email, telefono, direccion, identificacion, tipo_cliente)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nombre, email, telefono, direccion, identificacion, tipo_cliente]
    );

    const cliente_id = clienteResult.insertId;

    // ✅ Insertar en usuarios
    await connection.execute(
      `INSERT INTO usuarios (username, email, password, rol, cliente_id)
       VALUES (?, ?, ?, ?, ?)`,
      [username, email, hashedPassword, rol || 'cliente', cliente_id]
    );

    res.status(201).json({ message: '✅ Usuario cliente registrado correctamente' });
  } catch (error) {
    console.error('❌ Error al registrar usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};


router.post('/', validateEntity('usuario'), postUsuario);

// GET: Perfil del usuario autenticado (con datos del cliente)
const getPerfil: CustomHandler = async (req, res) => {
  try {
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    const [rows]: any = await connection.query(
      `SELECT 
        u.id, u.username, u.email, u.rol,
        c.id AS cliente_id,    
        c.nombre AS cliente_nombre,
        c.telefono AS cliente_telefono,
        c.direccion AS cliente_direccion,
        c.identificacion AS cliente_identificacion,
        c.tipo_cliente AS cliente_tipo
      FROM usuarios u
      LEFT JOIN clientes c ON u.cliente_id = c.id
      WHERE u.id = ?
      LIMIT 1`,
      [user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const row = rows[0];

    const perfil = {
      id: row.id,
      username: row.username,
      email: row.email,
      rol: row.rol,
      cliente: row.cliente_nombre
        ? {
          id: row.cliente_id,
            nombre: row.cliente_nombre,
            telefono: row.cliente_telefono,
            direccion: row.cliente_direccion,
            identificacion: row.cliente_identificacion,
            tipo_cliente: row.cliente_tipo,
          }
        : null,
    };

    res.json({ data: perfil });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};


router.get('/perfil', validateAuth, getPerfil);

export default router;
