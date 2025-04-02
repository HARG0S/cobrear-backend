export type Pedido = {
    id: number;
    cliente_id: number | null;
    fecha: string; // formato timestamp, se recibe como string desde MySQL
    estado: 'Pendiente' | 'Confirmado' | 'Enviado' | 'Cancelado';
};
