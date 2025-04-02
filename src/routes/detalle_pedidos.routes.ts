import { Router } from 'express';
import { connection } from '../config/db';
import { CustomHandler } from '../types/handlers/customhandler';
import { ServerResponse } from '../types/entities/serverresponse';

interface DetallePedido {
  id?: number;
  pedido_id: number;
  producto_id: number;
  cantidad: number;
}

interface Producto {
  id: string;
  cantidad: number;
}

const router = Router();

// GET: Obtener todos los detalles de pedidos
const getDetallesPedidos: CustomHandler = async (_req, res) => {
  try {
    const [rows] = await connection.query('SELECT * FROM detalle_pedidos');
    res.json({ data: rows as DetallePedido[] });
  } catch (error) {
    console.error('❌ Error al obtener detalle de pedidos:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

router.get('/', getDetallesPedidos);

// POST: Agregar productos a un pedido existente
const postDetallePedido: CustomHandler = async (req, res) => {
  const { pedido_id, productos } = req.body;

  if (!productos || productos.length === 0) {
    return res.status(400).json({ message: 'Debe incluir productos en el pedido' });
  }

  try {
    await Promise.all(
      productos.map((producto: Producto) =>
        connection.execute(
          'INSERT INTO detalle_pedidos (pedido_id, producto_id, cantidad) VALUES (?, ?, ?)',
          [pedido_id, producto.id, producto.cantidad]
        )
      )
    );

    res.status(201).json({ message: '✅ Productos agregados al pedido' });
  } catch (error) {
    console.error('❌ Error al agregar productos al pedido:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

router.post('/', postDetallePedido);

// DELETE: Eliminar un producto de un pedido
const deleteDetallePedido: CustomHandler = async (req, res) => {
  const { id } = req.params;

  try {
    await connection.execute('DELETE FROM detalle_pedidos WHERE id = ?', [id]);
    res.json({ message: '🗑️ Producto eliminado del pedido' });
  } catch (error) {
    console.error('❌ Error al eliminar producto del pedido:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

router.delete('/:id', deleteDetallePedido);

export default router;
