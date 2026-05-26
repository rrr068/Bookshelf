# Fly.io デプロイガイド

## 初期セットアップ

### 1. Fly.io CLI インストール
```bash
curl -L https://fly.io/install.sh | sh
```

### 2. Fly.io ログイン
```bash
flyctl auth login
```

### 3. アプリ作成
```bash
flyctl launch
```

入力項目：
- App Name: `bookshelf-app`
- Region: `nrt` (Tokyo)
- PostgreSQL: `Yes`
- Upstash Redis: `No`

### 4. GitHub Actions用トークン取得
```bash
flyctl tokens create deploy --name github-actions
```

コピーしたトークンを GitHub のシークレットに追加：
- Repository Settings → Secrets → `FLY_API_TOKEN`

---

## 環境変数設定

```bash
flyctl secrets set JWT_SECRET="your-secret-key"
flyctl secrets set NODE_ENV="production"
flyctl secrets set DATABASE_URL="postgres://..."  # 自動生成
```

---

## デプロイ方法

### 自動デプロイ（GitHub Actions）
```
main ブランチに push または PR merge
  ↓
GitHub Actions が自動テスト実行
  ↓
テスト成功後、Fly.io に自動デプロイ
```

### 手動デプロイ
```bash
flyctl deploy
```

---

## デプロイ後の確認

```bash
# ログ確認
flyctl logs

# アプリのURL確認
flyctl status

# データベース確認
flyctl postgres connect

# Secrets確認
flyctl secrets list
```

---

## トラブルシューティング

### イメージビルド失敗
```bash
flyctl deploy --no-cache
```

### データベース接続エラー
```bash
flyctl secrets list
# DATABASE_URL が設定されているか確認
```

### Nginx エラー
```bash
flyctl logs -f
```

---

## 本番運用

### 監視
```bash
flyctl dashboard  # Web UI
flyctl logs -f    # リアルタイムログ
```

### スケーリング
```bash
flyctl scale count 2  # インスタンス数増加
```

### ダウンタイムなしデプロイ
```bash
flyctl deploy --strategy rolling  # ローリングアップデート
```
