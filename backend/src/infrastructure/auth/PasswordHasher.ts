import bcrypt from 'bcryptjs';
import { IPasswordHasher } from '../../application/interfaces/IPasswordHasher';

/**
 * bcryptjsを使用したパスワードハッシュ化の実装
 */
export class PasswordHasher implements IPasswordHasher {
  private readonly saltRounds = 10;

  async hash(password: string): Promise<string> {
    return await bcrypt.hash(password, this.saltRounds);
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }
}
