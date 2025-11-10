import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from './env.js';

export const generateTokens = (payload: object) => {
  const accessTokenOption:SignOptions = { expiresIn: +env.ACCESS_TOKEN_EXPIRY }
  const refreshTokenOption:SignOptions = { expiresIn: +env.REFRESH_TOKEN_EXPIRY }
  
  const accessToken = jwt.sign(payload, env.JWT_ACCESS_SECRET, accessTokenOption);
  const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, refreshTokenOption);
  
  return { accessToken, refreshToken };
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, env.JWT_ACCESS_SECRET);
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET);
};
