import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../../frameworks/config/env.js';
import { TokenService } from '../../usecase/interfaces/tokenService.js';

export class JwtTokenService implements TokenService {
  sign(payload: object): string {
    const options: SignOptions = { expiresIn: env.JWT_EXPIRES_IN as unknown as SignOptions['expiresIn'] };
    console.log(options,env.JWT_EXPIRES_IN)
    return jwt.sign(payload, env.JWT_SECRET, options);
  }

  verify(token: string): any {
    return jwt.verify(token, env.JWT_SECRET);
  }
}
