export type Usuario = {
    id: number;
    nombre: string;
    email: string;
    password: string;
    rol: 'admin' | 'vendedor' | 'cliente';
};

export {};