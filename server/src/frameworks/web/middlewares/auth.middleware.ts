import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import UserModel from '../../database/models/user.model.js';
import { env } from '../../../frameworks/config/env.js';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token =
      req.headers.authorization?.split(' ')[1] || req.cookies?.token;

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    let payload: any;
    try {
      payload = jwt.verify(token, env.JWT_ACCESS_SECRET);
    } catch (err: any) {
      if (err instanceof jwt.TokenExpiredError) {
        return res.status(401).json({ message: 'TokenExpiredError' });
      }
      return res.status(401).json({ message: 'Invalid or malformed token' });
    }

    const user = await UserModel.findById(payload.id)
      .select('-password')
      .lean();

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized: User not found' });
    }

    (req as any).user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (err) {
    return res.status(500).json({ message: 'Internal authentication error' });
  }
};
