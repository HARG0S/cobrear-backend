import { Request, Response, NextFunction } from 'express';

const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error(' Error capturado:', err);
    res.status(500).json({ message: 'Error interno del servidor.' });
};

export default errorHandler;

