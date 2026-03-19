/**
 * パスワードハッシュ化サービスのインターフェース
 * 実装はInfrastructure層で行う
 */
export interface IPasswordHasher {
  /**
   * パスワードをハッシュ化
   */
  hash(password: string): Promise<string>;

  /**
   * パスワードとハッシュを比較
   */
  compare(password: string, hash: string): Promise<boolean>;
}
