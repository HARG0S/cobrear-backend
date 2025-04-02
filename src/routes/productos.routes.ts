import { Router } from 'express';
import { connection } from '../config/db';
import { Producto } from '../types/entities/producto';
import { ServerResponse } from '../types/entities/serverresponse';
import { CustomHandler } from '../types/handlers/customhandler';

const router = Router();

// GET: Obtener todos los productos
const getProductos: CustomHandler = async (req, res) => {
  const { categoria } = req.query;

  try {
    let query = 'SELECT * FROM productos';
    const params: any[] = [];

    if (categoria) {
      query += ' WHERE categoria_id = ?';
      params.push(categoria);
    }

    const [rows] = await connection.query(query, params);
    res.json({ data: rows as Producto[] });

  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

router.get('/', getProductos);

// POST: Agregar un nuevo producto
const postProducto: CustomHandler = async (req, res) => {
  const { nombre, descripcion, precio, categoria_id } = req.body;

  if (!nombre || !precio) {
    return res.status(400).json({ message: 'El nombre y precio son obligatorios' });
  }

  try {
    await connection.query(
      'INSERT INTO productos (nombre, descripcion, precio, categoria_id) VALUES (?, ?, ?, ?)',
      [nombre, descripcion, precio, categoria_id]
    );
    res.status(201).json({ message: 'Producto agregado correctamente' });
  } catch (error) {
    console.error('Error al agregar producto:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

router.post('/', postProducto);

export default router;
