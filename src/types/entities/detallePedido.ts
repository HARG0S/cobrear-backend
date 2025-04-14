export type DetallePedido = {
    id: number;
    pedido_id: number;
    producto_id: string;
    cantidad: number;

    // Datos opcionales que puede devolver una JOIN si hacés consultas extendidas
    nombre_producto?: string;
    precio_unitario?: number;
    subtotal?: number;
};
