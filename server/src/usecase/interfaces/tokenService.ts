export interface TokenService {
  signAccess(payload: object): string;
  signRefresh(payload: object): string;
  verifyAccess(token: string): any;
  verifyRefresh(token: string): any;
  generatePair(payload: object): { accessToken: string; refreshToken: string };
}
