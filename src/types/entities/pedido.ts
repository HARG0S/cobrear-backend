export type Pedido = {
    id: number;
    cliente_id: number | null;
    fecha: string;
    estado: 'pendiente' | 'procesando' | 'finalizado';
    telefono: string | null;
    nombre_cliente_manual: string | null;
    metodo_pago: string | null;
    con_factura: boolean;
    tipo_comprobante: 'A' | 'B' | 'remito';
    cancelado_por: number | null;
    fecha_cancelacion: string | null;
    vendido_por: number | null;
    fecha_venta: string | null;
    codigo_unico: string | null;
    fecha_creacion: string;
    navegador: string | null;
    ip: string | null;
  };
  