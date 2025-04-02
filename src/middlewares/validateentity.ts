import { Request, Response, NextFunction } from 'express';

export const validateEntity = (entityType: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const body = req.body;

    switch (entityType) {
      case 'categoria':
        if (!body.nombre) {
          res.status(400).json({ message: 'El nombre de la categoría es obligatorio' });
          return;
        }
        break;

      case 'producto':
        if (!body.nombre || !body.precio || !body.categoria_id) {
          res.status(400).json({ message: 'El producto debe tener nombre, precio y categoría' });
          return;
        }
        break;

      case 'variante':
        if (!body.producto_id || !body.nombre || !body.valor) {
          res.status(400).json({ message: 'La variante debe tener producto_id, nombre y valor' });
          return;
        }
        break;

      case 'detalle_pedido':
        if (!body.pedido_id || !body.producto_id || !body.cantidad) {
          res.status(400).json({ message: 'El detalle debe tener pedido_id, producto_id y cantidad' });
          return;
        }
        break;

      case 'usuario':
        if (!body.username || !body.password || !body.rol) {
          res.status(400).json({ message: 'El usuario debe tener username, password y rol' });
          return;
        }
        break;

      default:
        res.status(400).json({ message: 'Tipo de entidad no reconocido para validación' });
        return;
    }

    next();
  };
};
