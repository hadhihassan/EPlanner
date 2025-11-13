import jwt from 'jsonwebtoken';
import { env } from '../../frameworks/config/env.js';
import { TokenService } from '../../usecase/interfaces/tokenService.js';

export class JwtTokenService implements TokenService {
  signAccess(payload: object): string {
    return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: env.ACCESS_TOKEN_EXPIRY });
  }

  signRefresh(payload: object): string {
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: env.REFRESH_TOKEN_EXPIRY });
  }

  verifyAccess(token: string): any {
    return jwt.verify(token, env.JWT_ACCESS_SECRET);
  }

  verifyRefresh(token: string): any {
    return jwt.verify(token, env.JWT_REFRESH_SECRET);
  }

  generatePair(payload: object) {
    const accessToken = this.signAccess(payload);
    const refreshToken = this.signRefresh(payload);
    return { accessToken, refreshToken };
  }
}
