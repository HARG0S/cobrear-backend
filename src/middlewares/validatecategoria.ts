// src/middlewares/validatecategoria.ts
import { Request, Response, NextFunction } from 'express';

export const validateCategoria = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { nombre } = req.body;

  if (!nombre) {
    res.status(400).json({ message: 'El nombre es obligatorio' });
  } else {
    next();
  }
};

