import { Router } from 'express';
import { connection } from '../config/db';
import bcrypt from 'bcrypt';
import { CustomHandler } from '../types/handlers/customhandler';

const router = Router();

// ✅ Ruta temporal para crear usuario especial (admin o vendedor)
const crearUsuarioInterno: CustomHandler = async (req, res) => {
  const { username, email, password, rol } = req.body;

  if (!username || !email || !password || !rol) {
    return res.status(400).json({ message: 'Faltan campos' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await connection.execute(
    `INSERT INTO usuarios (username, email, password, rol)
     VALUES (?, ?, ?, ?)`,
    [username, email, hashedPassword, rol]
  );

  res.status(201).json({ message: `✅ Usuario ${rol} creado con éxito` });
};

router.post('/crear-usuario-interno', crearUsuarioInterno);

export default router;

