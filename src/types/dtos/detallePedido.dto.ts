export type DetallePedidoDTO = {
    id: number;
    pedido_id: number;
    producto_id: string;
    nombre_producto: string; // nombre para mostrar directo
    cantidad: number;
    precio_unitario: number;
    subtotal: number; // precio_unitario * cantidad
};
