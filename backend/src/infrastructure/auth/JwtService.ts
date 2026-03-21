import jwt from 'jsonwebtoken';
import { IJwtService, JwtPayload } from '../../application/interfaces/IJwtService';

/**
 * jsonwebtokenを使用したJWT処理の実装
 */
export class JwtService implements IJwtService {
  private readonly secret: string;
  private readonly expiresIn: string;

  constructor(secret?: string, expiresIn: string = '7d') {
    this.secret = secret || process.env.JWT_SECRET || 'default-secret-key';
    this.expiresIn = expiresIn;

    if (!secret && !process.env.JWT_SECRET) {
      console.warn('Warning: Using default JWT secret. Set JWT_SECRET in production.');
    }
  }

  generateToken(payload: JwtPayload): string {
    return jwt.sign(payload, this.secret, {
      expiresIn: this.expiresIn,
    });
  }

  verifyToken(token: string): JwtPayload | null {
    try {
      const decoded = jwt.verify(token, this.secret) as JwtPayload;
      return decoded;
    } catch (error) {
      return null;
    }
  }
}
