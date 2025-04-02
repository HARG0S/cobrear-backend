import { Router } from 'express';
import { connection } from '../config/db';
import { VarianteProducto } from '../types/entities/varianteproducto';
import { ServerResponse } from '../types/entities/serverresponse';
import { CustomHandler } from '../types/handlers/customhandler';

const router = Router();

// GET: Obtener todas las variantes de productos
const getVariantes: CustomHandler = async (_req, res) => {
  try {
    const [rows] = await connection.query('SELECT * FROM variantes_productos');
    res.json({ data: rows as VarianteProducto[] });
  } catch (error) {
    console.error('Error al obtener variantes:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

router.get('/', getVariantes);

// POST: Agregar una nueva variante de producto
const postVariante: CustomHandler = async (req, res) => {
  const { producto_id, nombre, valor } = req.body;

  if (!producto_id || !nombre || !valor) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios' });
  }

  try {
    await connection.query(
      'INSERT INTO variantes_productos (producto_id, nombre, valor) VALUES (?, ?, ?)',
      [producto_id, nombre, valor]
    );
    res.status(201).json({ message: 'Variante agregada correctamente' });
  } catch (error) {
    console.error('Error al agregar variante:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

router.post('/', postVariante);

export default router;
