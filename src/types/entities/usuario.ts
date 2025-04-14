export type Usuario = {
    id: number;
    username: string; // antes estaba como "nombre"
    email: string;
    password: string;
    rol: 'admin' | 'vendedor' | 'cliente';
    cliente_id?: number; // si está asociado a un cliente
  };
  