// validate-auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface DecodedToken {
  id: number;
  username: string;
  rol: string;
  iat: number;
  exp: number;
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: DecodedToken;
  }
}

export const validateAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Token no proporcionado o malformado' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedToken;

    req.user = decoded; // Ahora tipado correctamente
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token inválido o expirado' });
  }
};

export default validateAuth;
