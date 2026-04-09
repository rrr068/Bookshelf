# Bookshelf - 読書管理アプリ

個人開発・学習目的の読書管理アプリケーション。クリーンアーキテクチャ（DDD）を採用し、読書記録・書籍検索・統計機能を備えています。

## 技術スタック

### フロントエンド
- **React 18** + TypeScript + Vite
- **React Router v6** — ルーティング
- **Tailwind CSS** + shadcn/ui — スタイリング・UIコンポーネント
- **Recharts** — 統計グラフ
- **Axios** — API通信

### バックエンド
- **Hono** + TypeScript — Web フレームワーク
- **Prisma ORM** — データベースアクセス
- **SQLite** — データベース
- **Redis** — キャッシュ
- **JWT** + bcryptjs — 認証・パスワードハッシュ
- **Zod** — バリデーション

### インフラ
- **Docker** / Docker Compose

## 機能

- **ユーザー認証** — アカウント登録・ログイン（JWT）
- **書籍検索** — Google Books API と連携した書籍検索・登録
- **読書ステータス管理** — 読みたい・読書中・読了などのステータス管理
- **レビュー投稿** — 書籍への星評価・コメント投稿（1人1冊1レビュー）
- **いいね機能** — レビューへのいいね・本へのいいね
- **ダッシュボード** — 読書統計（月別・累計ページ数・ステータス別グラフ）
- **マイページ** — 登録済み書籍の一覧とステータス管理

## ディレクトリ構造

### バックエンド

クリーンアーキテクチャの依存関係ルール：**外側の層は内側の層に依存できるが、内側の層は外側の層に依存してはいけない**

```
backend/src/
├── domain/               # ドメイン層（最も内側・依存なし）
│   ├── entities/         # ビジネスエンティティ（User, Book, Review など）
│   └── repositories/     # リポジトリインターフェース（抽象）
│
├── application/          # アプリケーション層
│   ├── usecases/         # ユースケース（ビジネスロジックの実行フロー）
│   ├── dto/              # Data Transfer Object
│   └── interfaces/       # 外部サービスの抽象インターフェース
│
├── infrastructure/       # インフラストラクチャ層（外部依存の実装）
│   ├── database/
│   │   └── repositories/ # Prisma を使ったリポジトリ実装
│   ├── cache/            # Redis キャッシュサービス
│   ├── auth/             # JWT・パスワードハッシュの実装
│   └── di/               # 依存性注入コンテナ
│
└── presentation/         # プレゼンテーション層（最も外側）
    ├── routes/           # エンドポイント定義
    ├── controllers/      # HTTPリクエスト処理
    ├── middlewares/      # 認証チェック・エラーハンドリング
    └── validators/       # Zod バリデーションスキーマ
```

#### 各層の責務

| 層 | 責務 | 依存できる層 |
|---|---|---|
| **Domain** | ビジネスルール・エンティティ定義 | なし |
| **Application** | ユースケース実行・ビジネスフロー | Domain |
| **Infrastructure** | 外部システム連携・実装詳細 | Domain, Application |
| **Presentation** | HTTPリクエスト処理 | すべて |

### フロントエンド

```
frontend/src/
├── pages/               # ページコンポーネント（ルート単位）
├── components/
│   ├── ui/              # shadcn/ui ベースの汎用コンポーネント
│   └── ProtectedRoute   # 認証ガード
├── contexts/            # React Context（認証状態管理）
├── services/            # バックエンド API との通信
├── types/               # TypeScript 型定義
└── lib/                 # ユーティリティ
```

#### ページ構成

| パス | ページ | 認証 |
|---|---|---|
| `/` | ホームページ（ランディング） | 不要 |
| `/login` | ログイン | 不要 |
| `/signup` | アカウント登録 | 不要 |
| `/dashboard` | ダッシュボード | 必要 |
| `/books` | 書籍検索 | 必要 |
| `/book/:id` | 書籍詳細 | 必要 |
| `/profile` | マイページ | 必要 |

## データベース

Prisma ORM + SQLite を使用。以下のテーブルで構成されています。

- `users` — ユーザーアカウント
- `books` — 書籍マスター（Google Books API から取得）
- `reading_statuses` — ユーザーごとの読書ステータス
- `reviews` — 書籍レビュー・評価
- `likes` — レビューへのいいね
- `book_likes` — 書籍へのいいね

## セットアップ

### 前提条件
- Docker / Docker Compose がインストール済みであること
- Google Books API キーを取得済みであること

### 手順

1. リポジトリをクローン

2. 環境変数を設定
   ```bash
   # docker-compose.yml の GOOGLE_BOOKS_API_KEY に API キーを設定
   # または .env ファイルを作成
   echo "GOOGLE_BOOKS_API_KEY=your_api_key" > .env
   ```

3. Docker 環境を起動
   ```bash
   docker-compose up -d --build
   ```

4. ブラウザでアクセス
   - フロントエンド: http://localhost:5173
   - バックエンド (ヘルスチェック): http://localhost:3000/health

## 開発コマンド

```bash
# 起動
docker-compose up -d

# ログ確認
docker-compose logs -f
docker-compose logs -f backend
docker-compose logs -f frontend

# 停止
docker-compose down

# データを含めて完全削除
docker-compose down -v
```

## ライセンス

MIT
