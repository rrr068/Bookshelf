# GitHub Actions ワークフロー設定

## 必要なシークレット設定

GitHub Repository Settings → Secrets に以下を追加：

### 1. Fly.io デプロイ用
```
FLY_API_TOKEN = <flyctl tokens create deploy の出力>
```

### 2. Docker Registry（オプション）
GCR や Docker Hub にイメージをpushする場合：
```
DOCKERHUB_USERNAME = username
DOCKERHUB_TOKEN = token
```

## ワークフロー説明

### test.yml（PR・Push時）
- フロント: ESLint → TypeScript → Build
- バック: ESLint → TypeScript → Build
- Docker: イメージビルド＆push（ghcr.io）

**トリガー:**
- develop/main へのpush
- PR（develop/main 対象）

### deploy.yml（本番デプロイ）
- main へのpush または 手動トリガー
- Fly.io へデプロイ

**トリガー:**
- main へのpush
- workflow_dispatch（手動）

## ローカルテスト

```bash
# lint + build テスト
npm ci
npm run build

# Dockerビルド
docker build -f Dockerfile.prod -t bookshelf:latest .

# Fly.io ローカルテスト
flyctl deploy --local-only
```
