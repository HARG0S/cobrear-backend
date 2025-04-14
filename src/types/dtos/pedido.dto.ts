export type PedidoDTO = {
    id: number;
    codigo_unico: string;
    fecha: string;
    estado_entrega: 'pendiente' | 'parcial' | 'completa';
    nombre_cliente: string; // Puede venir de cliente registrado o del nombre manual
    telefono: string;
    metodo_pago: string;
    con_factura: boolean;
    tipo_comprobante: 'A' | 'B' | 'remito';
    total: number; // Este campo puede calcularse en backend con JOIN o subconsulta
};
