/**
 * JWTペイロード
 */
export interface JwtPayload {
  userId: string;
  email: string;
}

/**
 * JWTサービスのインターフェース
 * 実装はInfrastructure層で行う
 */
export interface IJwtService {
  /**
   * JWTトークンを生成
   */
  generateToken(payload: JwtPayload): string;

  /**
   * JWTトークンを検証してペイロードを取得
   */
  verifyToken(token: string): JwtPayload | null;
}
