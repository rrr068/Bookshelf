/**
 * Userエンティティ
 * ビジネスルールを持つ純粋なドメインオブジェクト
 */
export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly passwordHash: string,
    public readonly username: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  /**
   * ビジネスルール: メールアドレスの形式が正しいか検証
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * ビジネスルール: パスワードの強度を検証
   * 最低8文字以上
   */
  static isValidPasswordLength(password: string): boolean {
    return password.length >= 8;
  }

  /**
   * ビジネスルール: ユーザー名が有効か検証
   * 1文字以上、50文字以下
   */
  static isValidUsername(username: string): boolean {
    return username.length >= 1 && username.length <= 50;
  }

  /**
   * ファクトリメソッド: 新規ユーザーを生成
   */
  static create(
    email: string,
    passwordHash: string,
    username: string
  ): User {
    if (!this.isValidEmail(email)) {
      throw new Error('Invalid email format');
    }
    if (!this.isValidUsername(username)) {
      throw new Error('Username must be between 1 and 50 characters');
    }

    return new User(
      '', // IDはリポジトリで生成
      email.toLowerCase(),
      passwordHash,
      username,
      new Date(),
      new Date()
    );
  }
}
