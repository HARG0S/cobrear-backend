import { Router } from 'express';
import { connection } from '../config/db';
import { CustomHandler } from '../types/handlers/customhandler';
import { validateAuth } from '../middlewares/validate-auth';
import { mapRowToPedidoDTO } from '../utils/mapRowToPedidoDTO';


const router = Router();

// GET: Pedidos del cliente autenticado
const getMisPedidos: CustomHandler = async (req, res) => {
  try {
    const user = (req as any).user;

    if (!user || user.rol !== 'cliente') {
      res.status(403).json({ message: 'Acceso no autorizado' });
      return;
    }

    const [rows]: any = await connection.query(
      `SELECT * FROM pedidos WHERE cliente_id = ? AND estado != 'cancelado'`,
      [user.id]
    );

    res.json({ data: rows });
  } catch (error) {
    console.error(' Error al obtener pedidos del cliente:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

router.get('/mis-pedidos', validateAuth, getMisPedidos);

// GET: Todos los pedidos (solo para vendedores)
const getPedidos: CustomHandler = async (req, res) => {
  try {
    const user = (req as any).user;

    if (!user || user.rol !== 'vendedor') {
      res.status(403).json({ message: 'Acceso no autorizado' });
      return;
    }

    const [rows] = await connection.query('SELECT * FROM pedidos');
    res.json({ data: rows as any[] });
  } catch (error) {
    console.error(' Error al obtener pedidos:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

router.get('/', validateAuth, getPedidos);

// GET: Buscar pedido pendiente del usuario actual
const getPedidoPendiente: CustomHandler = async (req, res) => {
  try {
    const user = (req as any).user;

    if (!user || user.rol !== 'cliente') {
      res.status(403).json({ message: 'Acceso no autorizado' });
      return;
    }

    const [rows]: any = await connection.query(
      `SELECT * FROM pedidos WHERE cliente_id = ? AND estado = 'pendiente' ORDER BY id DESC LIMIT 1`,
      [user.id]
    );

    res.json({ data: rows[0] || null });
  } catch (error) {
    console.error(' Error al consultar pedido pendiente:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

router.get('/pendiente', validateAuth, getPedidoPendiente);

// GET: Traer un pedido completo con todos los detalles
const getPedidoConDetalles: CustomHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows]: any = await connection.query(`
      SELECT 
        p.id AS pedido_id,
        p.codigo_unico,
        p.fecha,
        p.estado,
        p.metodo_pago,
        p.tipo_comprobante,
        p.con_factura,
        p.telefono,
        p.nombre_cliente_manual,

        c.id AS cliente_id,
        c.username AS cliente_nombre,
        c.email AS cliente_email,

        dp.id AS detalle_id,
        dp.producto_id,
        dp.cantidad,

        pr.nombre AS producto_nombre,
        pr.precio AS producto_precio,
        (pr.precio * dp.cantidad) AS subtotal

      FROM pedidos p
      LEFT JOIN usuarios c ON p.cliente_id = c.id
      JOIN detalle_pedidos dp ON dp.pedido_id = p.id
      JOIN productos pr ON dp.producto_id = pr.id
      WHERE p.id = ?
    `, [id]);

    if (!rows.length) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    res.json({ data: mapRowToPedidoDTO(rows) });
  } catch (error) {
    console.error('Error al traer el pedido completo:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Este endpoint devuelve todos los datos de un pedido, incluyendo sus productos
router.get('/detallado/:id', getPedidoConDetalles);

// POST: Crear un nuevo pedido
const postPedido: CustomHandler = async (req, res) => {
  try {
    const {
      productos,
      cliente_id,
      telefono,
      nombre_cliente_manual,
      metodo_pago,
      con_factura,
      tipo_comprobante,
      codigo_unico // <- asegurate que llega como nombre exacto
    } = req.body;

    // Validaciones mínimas
    if (!productos || productos.length === 0) {
      return res.status(400).json({ message: 'Debe incluir productos en el pedido', pedidoId: 0 });
    }

    if (!cliente_id && (!telefono || !nombre_cliente_manual)) {
      return res.status(400).json({ message: 'Debe incluir nombre y teléfono si no hay cliente registrado', pedidoId: 0 });
    }

    // ✅ Inserción en tabla pedidos
    const [pedidoResult]: any = await connection.execute(
      `INSERT INTO pedidos (
        cliente_id,
        telefono,
        nombre_cliente_manual,
        metodo_pago,
        con_factura,
        tipo_comprobante,
        estado_entrega,
        codigo_unico
      ) VALUES (?, ?, ?, ?, ?, ?, 'pendiente', ?)`,
      [
        cliente_id || null,
        telefono || null,
        nombre_cliente_manual || null,
        metodo_pago || null,
        con_factura || false,
        tipo_comprobante || 'remito',
        codigo_unico
      ]
    );

    const pedidoId = pedidoResult.insertId;

    // Inserta cada producto en detalle_pedidos
    await Promise.all(
      productos.map((producto: { id: string; cantidad: number }) =>
        connection.execute(
          'INSERT INTO detalle_pedidos (pedido_id, producto_id, cantidad) VALUES (?, ?, ?)',
          [pedidoId, producto.id, producto.cantidad]
        )
      )
    );

    res.status(201).json({ message: '✅ Pedido creado con éxito', pedidoId });
  } catch (error) {
    console.error('❌ Error al crear pedido:', error);
    res.status(500).json({ message: 'Error interno del servidor', pedidoId: 0 });
  }
};


router.post('/', postPedido);

// PATCH: Cancelar un pedido
const cancelarPedido: CustomHandler = async (req, res) => {
  try {
    const user = (req as any).user;

    if (!user || user.rol !== 'vendedor') {
      res.status(403).json({ message: 'No tenés permisos para cancelar pedidos' });
      return;
    }

    const { id } = req.params;

    await connection.execute(
      `UPDATE pedidos SET estado = 'cancelado', cancelado_por = ?, fecha_cancelacion = NOW() WHERE id = ?`,
      [user.id, id]
    );

    res.json({ message: ' Pedido cancelado correctamente' });
  } catch (error) {
    console.error(' Error al cancelar pedido:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

router.patch('/cancelar/:id', validateAuth, cancelarPedido);

// PATCH: Marcar como vendido
const marcarComoVendido: CustomHandler = async (req, res) => {
  try {
    const user = (req as any).user;

    if (!user || user.rol !== 'vendedor') {
      res.status(403).json({ message: 'No tenés permisos para confirmar ventas' });
      return;
    }

    const { id } = req.params;

    await connection.execute(
      `UPDATE pedidos SET estado = 'vendido', vendido_por = ?, fecha_venta = NOW() WHERE id = ?`,
      [user.id, id]
    );

    res.json({ message: ' Pedido marcado como vendido' });
  } catch (error) {
    console.error(' Error al marcar pedido como vendido:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

router.patch('/vender/:id', validateAuth, marcarComoVendido);

// DELETE: Eliminar pedidos en estado pendiente
const deletePedido: CustomHandler = async (req, res) => {
  try {
    const user = (req as any).user;

    if (!user || user.rol !== 'vendedor') {
      res.status(403).json({ message: 'No tenés permisos para eliminar pedidos' });
      return;
    }

    const { id } = req.params;

    const [rows]: any = await connection.query(
      'SELECT estado FROM pedidos WHERE id = ?',
      [id]
    );

    if (!rows.length) {
      res.status(404).json({ message: 'Pedido no encontrado' });
      return;
    }

    if (rows[0].estado !== 'pendiente') {
      res.status(400).json({ message: 'Solo se pueden eliminar pedidos en estado pendiente' });
      return;
    }

    await connection.execute('DELETE FROM pedidos WHERE id = ?', [id]);

    res.json({ message: ' Pedido eliminado correctamente' });
  } catch (error) {
    console.error(' Error al eliminar pedido:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

router.delete('/:id', validateAuth, deletePedido);

// PUT: Actualizar estado de envío de un pedido
const actualizarEstadoEnvio: CustomHandler = async (req, res) => {
  try {
    const user = (req as any).user;

    if (!user || user.rol !== 'vendedor') {
      res.status(403).json({ message: 'No tenés permisos para actualizar estado de envío' });
      return;
    }

    const { id } = req.params;
    const { estado } = req.body;

    const estadosValidos = ['pendiente', 'procesando', 'enviado', 'entregado'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ message: 'Estado inválido' });
    }

    await connection.execute(
      `UPDATE pedidos SET estado = ? WHERE id = ?`,
      [estado, id]
    );

    res.json({ message: `📦 Estado actualizado a '${estado}' correctamente.` });
  } catch (error) {
    console.error(' Error al actualizar estado de pedido:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

router.put('/:id/estado', validateAuth, actualizarEstadoEnvio);

// GET: Buscar pedido por código único (para vendedor)
const buscarPedidoPorCodigo: CustomHandler = async (req, res) => {
  try {
    const user = (req as any).user;

    if (!user || user.rol !== 'vendedor') {
      return res.status(403).json({ message: 'Acceso denegado' });
    }

    const { codigo } = req.params;

    const [rows]: any = await connection.query(`
      SELECT 
        p.id AS pedido_id,
        p.codigo_unico,
        p.fecha,
        p.estado,
        p.metodo_pago,
        p.tipo_comprobante,
        p.con_factura,
        p.telefono,
        p.nombre_cliente_manual,

        c.id AS cliente_id,
        c.username AS cliente_nombre,
        c.email AS cliente_email,

        dp.id AS detalle_id,
        dp.producto_id,
        dp.cantidad,

        pr.nombre AS producto_nombre,
        pr.precio AS producto_precio,
        (pr.precio * dp.cantidad) AS subtotal

      FROM pedidos p
      LEFT JOIN usuarios c ON p.cliente_id = c.id
      JOIN detalle_pedidos dp ON dp.pedido_id = p.id
      JOIN productos pr ON dp.producto_id = pr.id
      WHERE p.codigo_unico = ?
    `, [codigo]);

    if (!rows.length) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    res.json({ data: mapRowToPedidoDTO(rows) });
  } catch (error) {
    console.error('❌ Error al buscar por código único:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

router.get('/codigo/:codigo', validateAuth, buscarPedidoPorCodigo);


export default router;
