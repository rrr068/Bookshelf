import { User } from '../entities/User';

/**
 * ユーザーリポジトリのインターフェース
 * 実装はInfrastructure層で行う
 */
export interface IUserRepository {
  /**
   * メールアドレスでユーザーを検索
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * IDでユーザーを検索
   */
  findById(id: string): Promise<User | null>;

  /**
   * メールアドレスが既に登録されているか確認
   */
  existsByEmail(email: string): Promise<boolean>;

  /**
   * ユーザーを保存
   */
  save(user: User): Promise<User>;
}
