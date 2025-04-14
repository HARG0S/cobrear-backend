import { Router } from 'express';
import { connection } from '../config/db';
import { CustomHandler } from '../types/handlers/customhandler';

const router = Router();

// GET /api/pedidos/cliente/:clienteId
const getPedidosPorCliente: CustomHandler = async (req, res) => {
  const { clienteId } = req.params;

  try {
    const [pedidos] = await connection.query(
      `SELECT * FROM pedidos WHERE cliente_id = ? ORDER BY fecha DESC`,
      [clienteId]
    );

    const pedidosConDetalles = await Promise.all(
      (pedidos as any[]).map(async (pedido) => {
        const [productos] = await connection.query(
          `SELECT dp.*, p.nombre AS nombre_producto, dp.precio_unitario,
            (dp.cantidad * dp.precio_unitario) AS subtotal
           FROM detalle_pedidos dp
           JOIN productos p ON p.id = dp.producto_id
           WHERE dp.pedido_id = ?`,
          [pedido.id]
        );

        return {
          ...pedido,
          productos,
          total: (productos as any[]).reduce((acc, prod) => acc + prod.subtotal, 0)
        };
      })
    );

    res.json({ data: pedidosConDetalles });
  } catch (error) {
    console.error('❌ Error al obtener pedidos del cliente:', error);
    res.status(500).json({ message: 'Error al obtener pedidos del cliente' });
  }
};

router.get('/:clienteId', getPedidosPorCliente);


export default router;
