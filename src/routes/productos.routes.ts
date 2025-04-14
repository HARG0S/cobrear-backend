import { Router } from 'express';
import { connection } from '../config/db';
import { Producto } from '../types/entities/producto';
import { CustomHandler } from '../types/handlers/customhandler';

const router = Router();

// GET: Obtener productos agrupados por categoría, con nombre de la categoría
const getProductosAgrupados: CustomHandler = async (_req, res) => {
  try {
    const [rows] = await connection.query<any[]>(`
      SELECT 
        p.id,
        p.nombre,
        p.descripcion,
        p.precio,
        p.categoria_id,
        c.nombre AS categoria_nombre
      FROM productos p
      JOIN categorias c ON p.categoria_id = c.id
    `);

    const agrupados: Record<string, {
      id: string;
      nombre: string;
      productos: Producto[];
    }> = {};

    for (const row of rows) {
      const catId = row.categoria_id;
      const catNombre = row.categoria_nombre;

      if (!agrupados[catId]) {
        agrupados[catId] = {
          id: catId,
          nombre: catNombre,
          productos: [],
        };
      }

      agrupados[catId].productos.push({
        id: row.id,
        nombre: row.nombre,
        descripcion: row.descripcion,
        precio: Number(row.precio), // ✅ Conversión segura
        categoria_id: row.categoria_id,
      });
    }

    res.json({ data: Object.values(agrupados) });
  } catch (error) {
    console.error('Error al agrupar productos:', error);
    res.status(500).json({ message: 'Error al agrupar productos' });
  }
};

router.get('/agrupados', getProductosAgrupados);

export default router;
