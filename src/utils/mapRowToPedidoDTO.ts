import { PedidoConDetalleDTO } from '../types/dtos/PedidoConDetalleDTO';

export const mapRowToPedidoDTO = (rows: any[]): PedidoConDetalleDTO => {
    const pedidoBase = rows[0];
  
    const productos = rows.map(row => ({
      detalle_id: row.detalle_id,
      producto_id: row.producto_id,
      nombre: row.producto_nombre, // <- cambiado de nombre_producto a nombre
      cantidad: row.cantidad,
      precio_unitario: row.producto_precio,
      subtotal: row.subtotal
    }));
  
    const total = productos.reduce((acc, p) => acc + p.subtotal, 0);
  
    return {
      id: pedidoBase.pedido_id,
      codigo_unico: pedidoBase.codigo_unico,
      fecha: pedidoBase.fecha,
      estado: pedidoBase.estado,
      tipo_comprobante: pedidoBase.tipo_comprobante,
      comprobante_url: pedidoBase.comprobante_url || null,
      productos,
      total
    };
  };
  

