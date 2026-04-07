# フロントエンド セットアップ手順

## 必要なパッケージのインストール

以下のコマンドを実行して、フロントエンドの依存関係をインストールしてください。

```bash
cd frontend
npm install
```

## インストールされるパッケージ

### UI関連
- `axios` - HTTPクライアント
- `react-router-dom` - ルーティング
- `class-variance-authority` - クラスバリアント管理
- `clsx` - クラス名の条件付き結合
- `tailwind-merge` - Tailwindクラスのマージ
- `lucide-react` - アイコン
- `@radix-ui/react-label` - Radix UIのLabelコンポーネント
- `@radix-ui/react-slot` - Radix UIのSlotコンポーネント

### CSS関連
- `tailwindcss` - CSSフレームワーク
- `tailwindcss-animate` - Tailwindアニメーション
- `autoprefixer` - CSSベンダープレフィックス
- `postcss` - CSS変換ツール

## Dockerでの起動

```bash
# ルートディレクトリで実行
docker-compose up -d --build

# ログ確認
docker-compose logs -f frontend
```

## 開発サーバーの確認

ブラウザで http://localhost:5173 にアクセスして、サインアップ画面が表示されることを確認してください。
