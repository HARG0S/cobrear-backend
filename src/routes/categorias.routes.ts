import { Router } from 'express';
import { connection } from '../config/db';
import { Categoria } from '../types/entities/categoria';
import { ServerResponse } from '../types/entities/serverresponse';
import { CustomHandler } from '../types/handlers/customhandler';
import { validateCategoria } from '../middlewares/validatecategoria';

const router = Router();

// GET: Obtener todas las categorías
const getCategorias: CustomHandler = async (_req, res) => {
  try {
    const [rows] = await connection.query('SELECT * FROM categorias');
    res.json({ data: rows as Categoria[] });
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

router.get('/', getCategorias);

// POST: Agregar una nueva categoría
const postCategoria: CustomHandler = async (req, res) => {
  const { nombre } = req.body;

  if (!nombre) {
    return res.status(400).json({ message: 'El nombre es obligatorio' });
  }

  try {
    await connection.query('INSERT INTO categorias (nombre) VALUES (?)', [nombre]);
    res.status(201).json({ message: 'Categoría creada con éxito' });
  } catch (error) {
    console.error('Error al agregar categoría:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

router.post('/', validateCategoria, postCategoria);

// PUT: Actualizar una categoría existente
const putCategoria: CustomHandler = async (req, res) => {
  const { id } = req.params;
  const { nombre } = req.body;

  if (!nombre) {
    return res.status(400).json({ message: 'El nombre es obligatorio' });
  }

  try {
    const [result]: any = await connection.query('UPDATE categorias SET nombre = ? WHERE id = ?', [nombre, id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }

    res.json({ message: 'Categoría actualizada correctamente' });
  } catch (error) {
    console.error('Error al actualizar categoría:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

router.put('/:id', putCategoria);

// DELETE: Eliminar una categoría
const deleteCategoria: CustomHandler = async (req, res) => {
  const { id } = req.params;

  try {
    const [result]: any = await connection.query('DELETE FROM categorias WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }

    res.json({ message: 'Categoría eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar categoría:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

router.delete('/:id', deleteCategoria);

export default router;
