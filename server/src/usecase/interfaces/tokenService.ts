export interface TokenService {
  sign(payload: object): string;
  verify(token: string): any;
}
