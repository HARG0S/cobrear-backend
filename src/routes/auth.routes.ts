console.log(' auth.routes cargado'); // al principio del archivo

import { Router } from 'express';
import { connection } from '../config/db';
import { CustomHandler } from '../types/handlers/customhandler';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = Router();

// Registro de usuario
const registerUser: CustomHandler = async (req, res) => {
    const { username, email, password, rol } = req.body;

    if (!username || !email || !password || !rol) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    try {
        const [existing]: any = await connection.query(
            'SELECT * FROM usuarios WHERE username = ? OR email = ?',
            [username, email]
        );

        if (existing.length > 0) {
            return res.status(409).json({ message: 'El usuario o email ya está registrado' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await connection.query(
            'INSERT INTO usuarios (username, email, password, rol) VALUES (?, ?, ?, ?)',
            [username, email, hashedPassword, rol]
        );

        res.status(201).json({ message: 'Usuario registrado con éxito' });
    } catch (error) {
        console.error('Error en /register:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Login de usuario
const loginUser: CustomHandler = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Usuario y contraseña son obligatorios' });
    }

    try {
        const [users]: any = await connection.query(
            'SELECT * FROM usuarios WHERE username = ?',
            [username]
        );

        const user = users[0];

        if (!user) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, rol: user.rol },
            process.env.JWT_SECRET as string,
            { expiresIn: '4h' }
        );

        res.json({
            message: 'Login exitoso',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                rol: user.rol
            }
        });

    } catch (error) {
        console.error(' Error en /login:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

router.post('/register', registerUser);
router.post('/login', loginUser);

export default router;
