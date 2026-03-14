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

- [ ] Phase 1: 環境構築 + クリーンアーキテクチャの基礎
- [ ] Phase 2: ユーザー認証機能
- [ ] Phase 3: 書籍管理機能
- [ ] Phase 4: 読書ステータス管理
- [ ] Phase 5: レビュー機能
- [ ] Phase 6: ソーシャル機能（いいね）

## ディレクトリ構造

クリーンアーキテクチャに基づいた構造:
- `domain/`: ビジネスロジックの中核（依存なし）
- `application/`: ユースケース層
- `infrastructure/`: 外部依存の実装
- `presentation/`: API/UI層

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

# 停止
docker-compose down
```

## ライセンス

MIT
