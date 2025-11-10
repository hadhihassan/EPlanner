import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import UserModel from '../../database/models/user.model.js';
import { env } from '../../../frameworks/config/env.js';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1] || req.cookies?.token;
    if (!token) return res.status(401).json({ message: 'Unauthorized' });
    const payload = jwt.verify(token, env.JWT_SECRET) as any;
    const user = await UserModel.findById(payload.id).select('-password').lean();
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    (req as any).user = { id: user._id.toString(), name: user.name, email: user.email, role: user.role };
    next();
  } catch (err) {
    next(err);
  }
};
