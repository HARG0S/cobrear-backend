import { Request, Response, NextFunction } from 'express';

export type CustomHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => any;
