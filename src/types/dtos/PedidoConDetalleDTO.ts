// types/dtos/PedidoConDetalleDTO.ts

export type PedidoConDetalleDTO = {
    id: number; // <-- AGREGALO
    codigo_unico: string;
    fecha: string;
    estado: 'pendiente' | 'procesando' | 'enviado' | 'entregado';
    tipo_comprobante: 'A' | 'B' | 'remito';
    comprobante_url?: string;
    productos: {
      detalle_id: number;
      producto_id: string;
      nombre: string;
      cantidad: number;
      precio_unitario: number;
      subtotal: number;
    }[];
    total: number;
  };
  