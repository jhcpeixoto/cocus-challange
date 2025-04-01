import { Request, Response } from 'express';

export interface Ctx {
  req: Request & { user?: { userId: string; email: string } };
  res: Response;
}