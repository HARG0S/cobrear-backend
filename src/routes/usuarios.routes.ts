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

// POST: Crear un nuevo usuario (con contraseña hasheada)
const postUsuario: CustomHandler = async (req, res) => {
  const { nombre, email, password, rol } = req.body;

  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds); // 🔒 Hasheamos la contraseña

    await connection.query(
      'INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)',
      [nombre, email, hashedPassword, rol]
    );

    res.status(201).json({ message: 'Usuario creado exitosamente' });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

router.post('/', validateEntity('usuario'), postUsuario);

// GET: Perfil del usuario autenticado
const getPerfil: CustomHandler = async (req, res) => {
  try {
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    const [rows]: any = await connection.query(
      'SELECT id, nombre, email, rol FROM usuarios WHERE id = ?',
      [user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({ data: rows[0] });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

router.get('/perfil', validateAuth, getPerfil);

export default router;
