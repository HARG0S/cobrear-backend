import { Router } from 'express';
import { connection } from '../config/db';
import { CustomHandler } from '../types/handlers/customhandler';
import { validateAuth } from '../middlewares/validate-auth';

const router = Router();

// 🔍 Buscar cliente
const buscarCliente: CustomHandler = async (req, res) => {
  // ... ya lo tenés implementado ...
};
router.get('/buscar', validateAuth, buscarCliente);

// 🔍 Obtener perfil del cliente por ID
const verPerfilCliente: CustomHandler = async (req, res) => {
  // 👈 ESTE es el bloque que me pediste
  const user = (req as any).user;
  const clienteId = req.params.id;

  if (!user || (user.rol !== 'vendedor' && user.rol !== 'admin')) {
    return res.status(403).json({ message: 'Acceso denegado' });
  }

  try {
    const [clienteRows]: any = await connection.query(
      `SELECT 
        c.id, c.nombre, c.telefono, c.direccion, c.identificacion, c.tipo_cliente,
        u.username, u.email, u.rol
      FROM clientes c
      LEFT JOIN usuarios u ON u.cliente_id = c.id
      WHERE c.id = ?
      LIMIT 1`,
      [clienteId]
    );

    if (!clienteRows.length) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    const cliente = clienteRows[0];

    const [pedidoRows]: any = await connection.query(
      `SELECT id, codigo_unico, fecha, estado, tipo_comprobante, comprobante_url
       FROM pedidos
       WHERE cliente_id = ?
       ORDER BY fecha DESC`,
      [clienteId]
    );

    res.json({
      data: {
        username: cliente.username,
        email: cliente.email,
        rol: cliente.rol,
        cliente: {
          nombre: cliente.nombre,
          telefono: cliente.telefono,
          direccion: cliente.direccion,
          identificacion: cliente.identificacion,
          tipo_cliente: cliente.tipo_cliente,
        },
        pedidos: pedidoRows
      }
    });
  } catch (error) {
    console.error('❌ Error al obtener perfil del cliente:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

router.get('/perfil/:id', validateAuth, verPerfilCliente);

// ✅ Obtener listado general de clientes
router.get('/todos', validateAuth, async (_req, res) => {
    try {
      const [clientes]: any = await connection.query(
        `SELECT c.id, c.nombre, c.email, c.identificacion
         FROM clientes c
         ORDER BY c.nombre ASC`
      );
  
      res.json({ data: clientes });
    } catch (error) {
      console.error('❌ Error al traer todos los clientes:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  });
  

export default router;