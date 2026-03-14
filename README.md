# Bookshelf - 読書管理アプリ

個人開発・学習目的の読書管理アプリケーション。クリーンアーキテクチャを採用し、段階的に機能を実装していきます。

## 技術スタック

- **フロントエンド**: Vite + React + TypeScript
- **バックエンド**: Hono + TypeScript
- **データベース**: SQLite（開発初期）
- **認証**: JWT
- **書籍API**: Google Books API
- **環境**: Docker

## 機能（予定）

- [ ] ユーザー認証（JWT）
- [ ] 書籍検索（Google Books API）
- [ ] 読書ステータス管理（読みたい、読書中、読了など）
- [ ] レビュー投稿
- [ ] いいね機能

## 開発フェーズ

- [x] Phase 1: 環境構築 + クリーンアーキテクチャの基礎
- [ ] Phase 2: ユーザー認証機能
- [ ] Phase 3: 書籍管理機能
- [ ] Phase 4: 読書ステータス管理
- [ ] Phase 5: レビュー機能
- [ ] Phase 6: ソーシャル機能（いいね）

## ディレクトリ構造

### バックエンド (`backend/src/`)

クリーンアーキテクチャの依存関係ルール：**外側の層は内側の層に依存できるが、内側の層は外側の層に依存してはいけない**

```
backend/src/
├── domain/               # ドメイン層（最も内側・依存なし）
│   ├── entities/         # ビジネスエンティティ（User, Book, Review など）
│   │   └── *.ts          # - ビジネスルールを持つ純粋なTypeScriptクラス
│   │                     # - 他の層への依存を一切持たない
│   │                     # - 例: User, Book, Review, ReadingStatus
│   │
│   ├── repositories/     # リポジトリインターフェース（抽象）
│   │   └── *.ts          # - データ永続化の抽象インターフェース
│   │                     # - 実装は infrastructure 層で行う
│   │                     # - 例: IUserRepository, IBookRepository
│   │
│   └── services/         # ドメインサービス（複数エンティティにまたがるビジネスロジック）
│       └── *.ts          # - 単一エンティティに収まらないビジネスルール
│                         # - 例: 重複チェック、複雑な計算ロジック
│
├── application/          # アプリケーション層（ユースケース）
│   ├── usecases/         # ユースケースの実装 ★必須★
│   │   └── *.ts          # - ビジネスロジックの実行フロー（オーケストレーション）
│   │                     # - リポジトリを使ってデータを取得・保存
│   │                     # - ドメインサービスを呼び出し
│   │                     # - トランザクション管理
│   │                     # - 例: CreateUserUseCase, SearchBooksUseCase
│   │                     #      AddBookToShelfUseCase, PostReviewUseCase
│   │
│   ├── dto/              # Data Transfer Object
│   │   └── *.ts          # - 層間でデータをやり取りするための型定義
│   │                     # - リクエスト/レスポンスの型
│   │
│   └── interfaces/       # アプリケーションサービスのインターフェース
│       └── *.ts          # - 外部サービスの抽象インターフェース
│                         # - 例: IEmailService, IBookApiService
│
├── infrastructure/       # インフラストラクチャ層（外部依存の実装）
│   ├── database/         # データベース関連
│   │   ├── connection.ts # - DB接続設定
│   │   ├── repositories/ # - リポジトリの具体的実装
│   │   │   └── *.ts      # - SQLiteを使った永続化ロジック
│   │   │                 # - 例: UserRepository, BookRepository
│   │   └── migrations/   # - マイグレーションファイル
│   │       └── *.sql     # - テーブル定義、スキーマ変更
│   │
│   ├── external/         # 外部APIクライアント
│   │   └── *.ts          # - Google Books API などの外部サービス連携
│   │                     # - 例: GoogleBooksApiClient
│   │
│   └── auth/             # 認証・認可の実装
│       └── *.ts          # - JWT生成・検証、パスワードハッシュ化
│                         # - 例: JwtService, PasswordHasher
│
└── presentation/         # プレゼンテーション層（最も外側）
    ├── routes/           # ルート定義
    │   └── *.ts          # - エンドポイントの定義とルーティング
    │                     # - 例: userRoutes.ts, bookRoutes.ts
    │
    ├── controllers/      # コントローラー
    │   └── *.ts          # - HTTPリクエストを受け取る
    │                     # - リクエストのバリデーション
    │                     # - ユースケースを呼び出し
    │                     # - レスポンスを整形して返す
    │                     # - 例: UserController, BookController
    │
    ├── middlewares/      # ミドルウェア
    │   └── *.ts          # - 認証チェック、エラーハンドリング
    │                     # - 例: authMiddleware, errorHandler
    │
    └── validators/       # バリデーター
        └── *.ts          # - リクエストボディのバリデーション
                          # - 例: Zod スキーマ定義
```

### 各層の責務と依存関係

| 層 | 責務 | 依存できる層 | 依存してはいけない層 |
|---|---|---|---|
| **Domain** | ビジネスルール、エンティティ定義 | なし | すべて |
| **Application** | ユースケース実行、ビジネスフロー | Domain | Infrastructure, Presentation |
| **Infrastructure** | 外部システムとの連携、実装詳細 | Domain, Application | Presentation |
| **Presentation** | HTTPリクエスト処理、UI制御 | すべて | なし |

### データフロー例（書籍検索機能の場合）

```
1. ユーザーリクエスト
   ↓
2. Presentation層
   routes/bookRoutes.ts → controllers/BookController.ts
   - リクエストを受け取り、バリデーション
   ↓
3. Application層
   usecases/SearchBooksUseCase.ts
   - ビジネスロジック実行
   - GoogleBooksApiClient を呼び出し
   - 結果を Book エンティティに変換
   ↓
4. Infrastructure層
   external/GoogleBooksApiClient.ts
   - 外部API呼び出し
   ↓
5. Domain層
   entities/Book.ts
   - データをエンティティとして表現
   ↓
6. レスポンス返却（逆順）
```

### フロントエンド (`frontend/src/`)

```
frontend/src/
├── components/          # Reactコンポーネント
│   ├── common/          # - 共通コンポーネント（Button, Input など）
│   ├── features/        # - 機能別コンポーネント（BookCard, ReviewForm など）
│   └── layouts/         # - レイアウトコンポーネント（Header, Sidebar など）
│
├── hooks/               # カスタムフック
│   └── *.ts             # - 状態管理、API呼び出しロジック
│
├── services/            # APIクライアント
│   └── api.ts           # - バックエンドAPIとの通信
│
├── types/               # TypeScript型定義
│   └── *.ts             # - エンティティ、リクエスト/レスポンスの型
│
├── utils/               # ユーティリティ関数
│   └── *.ts             # - 汎用的な関数（日付フォーマットなど）
│
└── pages/               # ページコンポーネント
    └── *.tsx            # - ルート単位のページ
```

### usecaseディレクトリの重要性

**usecaseディレクトリは必須です。**

- **理由1**: ビジネスロジックの明確化
  - 「ユーザー登録」「書籍検索」などの具体的なユースケースを1つのクラスで表現
  - 何ができるのかが一目でわかる

- **理由2**: テストのしやすさ
  - ユースケース単位でテストを書ける
  - モックを使った単体テストが容易

- **理由3**: 依存関係の制御
  - コントローラーから直接リポジトリを呼ばない
  - ユースケースがオーケストレーションを担当

- **理由4**: 再利用性
  - 同じユースケースをWeb API、CLI、バッチ処理などで共有可能

## データベース設計

### ER図

```
┌─────────────┐         ┌──────────────────┐         ┌─────────────┐
│   users     │         │ reading_statuses │         │    books    │
├─────────────┤         ├──────────────────┤         ├─────────────┤
│ id (PK)     │─────┬──<│ id (PK)          │>───┬───│ id (PK)     │
│ email       │     │   │ user_id (FK)     │    │   │ google_...  │
│ password... │     │   │ book_id (FK)     │    │   │ title       │
│ username    │     │   │ status           │    │   │ authors     │
│ created_at  │     │   │ started_at       │    │   │ ...         │
│ updated_at  │     │   │ finished_at      │    │   └─────────────┘
└─────────────┘     │   │ created_at       │    │
                    │   │ updated_at       │    │
                    │   └──────────────────┘    │
                    │                            │
                    │   ┌──────────────────┐    │
                    └──<│    reviews       │>───┘
                        ├──────────────────┤
                        │ id (PK)          │
                        │ user_id (FK)     │
                        │ book_id (FK)     │
                        │ rating           │
                        │ comment          │
                        │ created_at       │
                        │ updated_at       │
                        └──────────────────┘
                                │
                                │
                        ┌───────┴──────────┐
                        │      likes       │
                        ├──────────────────┤
                        │ id (PK)          │
                        │ user_id (FK)     │
                        │ review_id (FK)   │
                        │ created_at       │
                        └──────────────────┘
```

### テーブル定義

#### 1. users（ユーザー）
ユーザーアカウント情報を管理

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | TEXT | PK | UUID（ランダム16バイト） |
| email | TEXT | UNIQUE, NOT NULL | メールアドレス（ログインID） |
| password_hash | TEXT | NOT NULL | bcryptでハッシュ化されたパスワード |
| username | TEXT | NOT NULL | 表示名 |
| created_at | TEXT | DEFAULT CURRENT_TIMESTAMP | 作成日時 |
| updated_at | TEXT | DEFAULT CURRENT_TIMESTAMP | 更新日時 |

**インデックス:**
- `idx_users_email` ON `email` - ログイン時の検索高速化

---

#### 2. books（書籍）
書籍マスターデータ（Google Books APIから取得）

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | TEXT | PK | UUID |
| google_books_id | TEXT | UNIQUE | Google Books API の書籍ID |
| title | TEXT | NOT NULL | 書籍タイトル |
| authors | TEXT | | 著者名（カンマ区切り） |
| publisher | TEXT | | 出版社 |
| published_date | TEXT | | 出版日 |
| description | TEXT | | 書籍説明 |
| isbn_10 | TEXT | | ISBN-10 |
| isbn_13 | TEXT | | ISBN-13 |
| page_count | INTEGER | | ページ数 |
| thumbnail_url | TEXT | | サムネイル画像URL |
| language | TEXT | DEFAULT 'ja' | 言語コード |
| created_by | TEXT | FK(users.id) | 登録ユーザー |
| created_at | TEXT | DEFAULT CURRENT_TIMESTAMP | 作成日時 |
| updated_at | TEXT | DEFAULT CURRENT_TIMESTAMP | 更新日時 |

**インデックス:**
- `idx_books_google_id` ON `google_books_id` - 外部API連携時の検索
- `idx_books_title` ON `title` - タイトル検索
- `idx_books_isbn13` ON `isbn_13` - ISBNでの検索

**注意点:**
- `authors` はカンマ区切りのテキスト（正規化しない理由：検索頻度が低く、シンプルさを優先）
- `google_books_id` が UNIQUE なので、同じ書籍の重複登録を防ぐ

---

#### 3. reading_statuses（読書ステータス）
ユーザーと書籍の関係（読みたい、読書中、読了など）

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | TEXT | PK | UUID |
| user_id | TEXT | FK(users.id), NOT NULL | ユーザーID |
| book_id | TEXT | FK(books.id), NOT NULL | 書籍ID |
| status | TEXT | NOT NULL | 読書ステータス |
| started_at | TEXT | | 読書開始日時 |
| finished_at | TEXT | | 読了日時 |
| created_at | TEXT | DEFAULT CURRENT_TIMESTAMP | 作成日時 |
| updated_at | TEXT | DEFAULT CURRENT_TIMESTAMP | 更新日時 |

**ステータス値（status）:**
- `want_to_read` - 読みたい
- `reading` - 読書中
- `completed` - 読了
- `on_hold` - 一時中断
- `dropped` - 読むのをやめた

**制約:**
- UNIQUE(user_id, book_id) - 1ユーザーが同じ書籍に対して1つのステータスのみ

**インデックス:**
- `idx_reading_statuses_user` ON `user_id` - マイページでの一覧表示
- `idx_reading_statuses_book` ON `book_id` - 書籍詳細での読者数表示
- `idx_reading_statuses_status` ON `status` - ステータス別フィルタリング

---

#### 4. reviews（レビュー）
書籍に対するユーザーレビュー

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | TEXT | PK | UUID |
| user_id | TEXT | FK(users.id), NOT NULL | レビュー投稿者 |
| book_id | TEXT | FK(books.id), NOT NULL | 書籍ID |
| rating | INTEGER | CHECK(1 <= rating <= 5) | 評価（1〜5星） |
| comment | TEXT | | レビュー本文 |
| created_at | TEXT | DEFAULT CURRENT_TIMESTAMP | 作成日時 |
| updated_at | TEXT | DEFAULT CURRENT_TIMESTAMP | 更新日時 |

**制約:**
- UNIQUE(user_id, book_id) - 1ユーザーが同じ書籍に対して1つのレビューのみ

**インデックス:**
- `idx_reviews_book` ON `book_id` - 書籍詳細でのレビュー一覧
- `idx_reviews_user` ON `user_id` - ユーザーのレビュー一覧
- `idx_reviews_created_at` ON `created_at DESC` - 新着レビュー表示

---

#### 5. likes（いいね）
レビューに対するいいね

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | TEXT | PK | UUID |
| user_id | TEXT | FK(users.id), NOT NULL | いいねしたユーザー |
| review_id | TEXT | FK(reviews.id), NOT NULL | いいね対象のレビュー |
| created_at | TEXT | DEFAULT CURRENT_TIMESTAMP | 作成日時 |

**制約:**
- UNIQUE(user_id, review_id) - 1ユーザーが同じレビューに対して1回のみいいね可能
- ON DELETE CASCADE - レビュー削除時に関連するいいねも削除

**インデックス:**
- `idx_likes_review` ON `review_id` - レビューのいいね数カウント
- `idx_likes_user` ON `user_id` - ユーザーがいいねしたレビュー一覧

---

### マイグレーション管理

マイグレーションファイルは `backend/src/infrastructure/database/migrations/` に配置。

**命名規則:** `{連番}_{説明}.sql`

例:
- `001_create_users_table.sql`
- `002_create_books_table.sql`
- `003_create_reading_statuses_table.sql` ← 今後追加
- `004_create_reviews_table.sql` ← 今後追加
- `005_create_likes_table.sql` ← 今後追加

**実行タイミング:**
- アプリケーション起動時に自動実行（`src/index.ts`）
- 既に実行済みのマイグレーションはスキップされる（CREATE TABLE IF NOT EXISTS）

---

### データベース選択の理由

**Phase 1-4: SQLite**
- ローカル開発が簡単
- セットアップ不要
- トランザクション対応
- 小〜中規模データに十分

**Phase 5以降: PostgreSQL への移行を検討**
- 複数ユーザーの同時アクセス
- 全文検索機能（書籍タイトル・レビュー検索）
- JSON型のサポート（書籍メタデータの柔軟な保存）

---

## セットアップ

1. リポジトリをクローン
2. 環境変数を設定
   ```bash
   cp .env.example .env
   # .env ファイルを編集してAPIキーを設定
   ```
3. Docker環境を起動
   ```bash
   docker-compose up -d
   ```
4. ブラウザで http://localhost:5173 にアクセス

## 開発

```bash
# Docker環境の起動
docker-compose up -d

# ログ確認
docker-compose logs -f

# 特定のサービスのログ確認
docker-compose logs -f backend
docker-compose logs -f frontend

# 停止
docker-compose down

# データベースを含めて完全削除
docker-compose down -v
```

- ✅ Docker環境が完全に動作
- ✅ フロントエンド（React）とバックエンド（Hono）が通信可能
- ✅ SQLiteデータベースが作成され、基本テーブル（users, books）が存在
- ✅ クリーンアーキテクチャのディレクトリ構造が確立
- ✅ ホットリロードが機能
- ✅ 環境変数で設定を管理

### アクセス方法

- フロントエンド: http://localhost:5173
- バックエンドヘルスチェック: http://localhost:3000/health

## ライセンス

MIT
