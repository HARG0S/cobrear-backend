// src/types/dtos/UsuarioConClienteDTO.ts

export type UsuarioConClienteDTO = {
    id: number;
    username: string;
    email: string;
    rol: 'cliente';
  
    cliente: {
      nombre: string;
      telefono: string;
      direccion: string;
      identificacion: string;
      tipo_cliente: 'particular' | 'empresa';
    };
  };
  