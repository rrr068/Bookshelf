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
