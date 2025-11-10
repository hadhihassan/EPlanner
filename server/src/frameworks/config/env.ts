import dotenv from 'dotenv';
import { z } from 'zod';
dotenv.config();

const schema = z.object({
  PORT: z.string().default('4000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGO_URI: z.string().min(1),
  JWT_SECRET: z.string().min(10),
  JWT_EXPIRES_IN: z.string().default('7d'),
  REDIS_HOST: z.string().default('127.0.0.1'),
  REDIS_PORT: z.string().default('6379'),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  EMAIL_HOST: z.string().optional(),
  ACCESS_TOKEN_EXPIRY: z.string().default('15m'),
  REFRESH_TOKEN_EXPIRY: z.string().default('15m'),
  EMAIL_USER: z.string().optional(),
  EMAIL_PASS: z.string().optional(),
  FRONTEND_URL: z.string().default('http://localhost:3000')
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error('Env validation error', parsed.error.format());
  throw new Error('Invalid ENV');
}

export const env = {
  PORT: Number(parsed.data.PORT),
  NODE_ENV: parsed.data.NODE_ENV,
  MONGO_URI: parsed.data.MONGO_URI,
  JWT_SECRET: parsed.data.JWT_SECRET,
  JWT_EXPIRES_IN: parsed.data.JWT_EXPIRES_IN ,
  ACCESS_TOKEN_EXPIRY: parsed.data.ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_EXPIRY: parsed.data.REFRESH_TOKEN_EXPIRY,
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'access_secret',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'refresh_secret',
  REDIS_HOST: parsed.data.REDIS_HOST,
  REDIS_PORT: Number(parsed.data.REDIS_PORT),
  CLOUDINARY: {
    CLOUD_NAME: parsed.data.CLOUDINARY_CLOUD_NAME,
    API_KEY: parsed.data.CLOUDINARY_API_KEY,
    API_SECRET: parsed.data.CLOUDINARY_API_SECRET
  },
  EMAIL: {
    HOST: parsed.data.EMAIL_HOST,
    USER: parsed.data.EMAIL_USER,
    PASS: parsed.data.EMAIL_PASS
  },
  FRONTEND_URL: parsed.data.FRONTEND_URL
};
