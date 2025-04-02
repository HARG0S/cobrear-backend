export interface ServerResponse<T = any> {
  data?: T;
  message?: string;
  [key: string]: any; // Agrega flexibilidad SIN afectar lo anterior
}

