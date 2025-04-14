export type ResumenPedidoDTO = {
    id: number;
    codigo_unico: string;
    fecha: string;
    estado: 'pendiente' | 'procesando' | 'enviado' | 'entregado';
    tipo_comprobante: 'A' | 'B' | 'remito';
    comprobante_url?: string;
  };
  