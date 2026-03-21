import Database from 'better-sqlite3';
import { User } from '../../../domain/entities/User';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';

/**
 * SQLiteを使用したユーザーリポジトリの実装
 * データベースへのアクセスを抽象化し、ドメインエンティティとの変換を行う
 */
export class UserRepository implements IUserRepository {
  constructor(private readonly db: Database.Database) {}

  /**
   * メールアドレスでユーザーを検索
   *
   * 処理の流れ：
   * 1. メールアドレスを小文字に正規化してSQLクエリを準備
   * 2. データベースから該当するユーザーレコードを1件取得
   * 3. レコードが存在しない場合はnullを返す
   * 4. レコードが存在する場合はUserエンティティに変換して返す
   *
   * @param email - 検索するメールアドレス
   * @returns 見つかったUserエンティティ、存在しない場合はnull
   */
  async findByEmail(email: string): Promise<User | null> {
    const stmt = this.db.prepare(
      'SELECT * FROM users WHERE email = ? LIMIT 1'
    );
    const row = stmt.get(email.toLowerCase()) as any;

    if (!row) {
      return null;
    }

    return this.mapToEntity(row);
  }

  /**
   * IDでユーザーを検索
   *
   * 処理の流れ：
   * 1. ユーザーIDでSQLクエリを準備
   * 2. データベースから該当するユーザーレコードを1件取得
   * 3. レコードが存在しない場合はnullを返す
   * 4. レコードが存在する場合はUserエンティティに変換して返す
   *
   * @param id - 検索するユーザーID
   * @returns 見つかったUserエンティティ、存在しない場合はnull
   */
  async findById(id: string): Promise<User | null> {
    const stmt = this.db.prepare('SELECT * FROM users WHERE id = ? LIMIT 1');
    const row = stmt.get(id) as any;

    if (!row) {
      return null;
    }

    return this.mapToEntity(row);
  }

  /**
   * メールアドレスが既に登録されているかチェック
   *
   * 処理の流れ：
   * 1. メールアドレスを小文字に正規化
   * 2. COUNT(*)で該当するレコード数を取得
   * 3. 1件以上存在すればtrue、0件ならfalseを返す
   *
   * ユースケース：
   * - 新規ユーザー登録時の重複チェック
   *
   * @param email - チェックするメールアドレス
   * @returns 既に存在する場合true、存在しない場合false
   */
  async existsByEmail(email: string): Promise<boolean> {
    const stmt = this.db.prepare(
      'SELECT COUNT(*) as count FROM users WHERE email = ?'
    );
    const result = stmt.get(email.toLowerCase()) as { count: number };
    return result.count > 0;
  }

  /**
   * ユーザーを保存（新規作成 or 更新）
   *
   * 処理の流れ：
   * 【新規作成の場合（user.idが空）】
   * 1. INSERT文を準備
   * 2. ユーザー情報をデータベースに挿入
   *    - IDはSQLiteのDEFAULT値（UUID）で自動生成される
   *    - メールアドレス、パスワードハッシュ、ユーザー名、タイムスタンプを保存
   * 3. 挿入後、メールアドレスで再検索して完全なエンティティを取得
   * 4. 取得に失敗した場合はエラーをスロー
   * 5. 作成されたUserエンティティを返す
   *
   * 【更新の場合（user.idが存在）】
   * 1. UPDATE文を準備
   * 2. 既存のユーザー情報を更新
   *    - updated_atは現在時刻で上書き
   * 3. 更新後、IDで再検索して最新のエンティティを取得
   * 4. 取得に失敗した場合はエラーをスロー
   * 5. 更新されたUserエンティティを返す
   *
   * 注意点：
   * - トランザクション管理はユースケース層で行う
   * - 楽観的ロックは実装していない（将来的に必要に応じて追加）
   *
   * @param user - 保存するUserエンティティ
   * @returns 保存後のUserエンティティ（IDが付与された状態）
   * @throws 保存に失敗した場合
   */
  async save(user: User): Promise<User> {
    // 新規作成の場合（IDが空）
    if (!user.id) {
      const stmt = this.db.prepare(`
        INSERT INTO users (email, password_hash, username, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?)
      `);

      stmt.run(
        user.email,
        user.passwordHash,
        user.username,
        user.createdAt.toISOString(),
        user.updatedAt.toISOString()
      );

      // 作成されたユーザーをメールアドレスで取得
      // （SQLiteのlastInsertRowidは数値だが、IDはUUIDなので使えない）
      const createdUser = await this.findByEmail(user.email);
      if (!createdUser) {
        throw new Error('Failed to create user');
      }

      return createdUser;
    }

    // 更新の場合
    const stmt = this.db.prepare(`
      UPDATE users
      SET email = ?, password_hash = ?, username = ?, updated_at = ?
      WHERE id = ?
    `);

    stmt.run(
      user.email,
      user.passwordHash,
      user.username,
      new Date().toISOString(),
      user.id
    );

    const updatedUser = await this.findById(user.id);
    if (!updatedUser) {
      throw new Error('Failed to update user');
    }

    return updatedUser;
  }

  /**
   * データベース行をドメインエンティティにマッピング
   *
   * 処理の流れ：
   * 1. データベースのカラム名（スネークケース）からデータを取得
   * 2. Userエンティティのコンストラクタに渡す形式に変換
   *    - created_at, updated_atは文字列からDateオブジェクトに変換
   * 3. Userエンティティのインスタンスを生成して返す
   *
   * マッピング詳細：
   * - row.id → User.id
   * - row.email → User.email
   * - row.password_hash → User.passwordHash
   * - row.username → User.username
   * - row.created_at (ISO文字列) → User.createdAt (Date)
   * - row.updated_at (ISO文字列) → User.updatedAt (Date)
   *
   * @param row - データベースから取得した生のレコード
   * @returns Userエンティティ
   */
  private mapToEntity(row: any): User {
    return new User(
      row.id,
      row.email,
      row.password_hash,
      row.username,
      new Date(row.created_at),
      new Date(row.updated_at)
    );
  }
}
