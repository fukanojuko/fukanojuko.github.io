# fukanojuko.github.io

ゲーム制作団体 **fukanojuko** の作品ポートフォリオサイト。
コンテスト（東京ゲームダンジョン等）提出時に、作品ごとの固定URLを掲載する用途。

- 公開URL: `https://fukanojuko.github.io/`
- 作品URL: `https://fukanojuko.github.io/<slug>/`（`<slug>` は英小文字・数字・ハイフン）
- 技術: [Astro](https://astro.build/)（Content Collections）＋ [Sveltia CMS](https://github.com/sveltia/sveltia-cms)（Git-backed の編集UI）
- デプロイ: GitHub Actions →  GitHub Pages

---

## 1. ローカル開発手順

Node.js は **22.12 以上**（推奨 24 LTS / Astro 6 の要件）が必要。リポジトリ直下に `.node-version`（`24.16.0`）を置いてあるので、fnm / nvm 等を使っていれば自動でそのバージョンに切り替わる。パッケージマネージャは npm を使用（pnpm / bun でも可・lockfile に合わせる）。

```bash
npm install      # 依存をインストール
npm run dev      # 開発サーバ（http://localhost:4321/）
npm run build    # 本番ビルド（出力は dist/）
npm run preview  # ビルド結果をローカル確認
npm run check    # 型・コンテンツのチェック（任意）
```

> bun を使う場合は `bun install` / `bun run dev` 等。lockfile（`bun.lockb`）に合わせて GitHub Actions も自動でマネージャを切り替える。

---

## 2. GitHub Pages の有効化（初回のみ・手動）

リポジトリの **Settings → Pages → Build and deployment → Source** を **「GitHub Actions」** に設定する。
（Source が「Deploy from a branch」のままだと Actions のデプロイが反映されない）

設定後、`main` への push で `.github/workflows/deploy.yml` が走り、自動でビルド＆公開される。

### GitHub Actions の構成（`.github/workflows/`）

| ワークフロー | トリガー | 内容 |
| --- | --- | --- |
| `deploy.yml` | `main` への push / 手動 | ビルドして GitHub Pages に公開 |
| `ci.yml` | PR（→ `main`）/ 手動 | `npm run check`（型/コンテンツ）＋ `npm run build` を検証。**デプロイはしない** |
| `pr-reviewer.yml` | PRが open / reopen / draft解除 | レビュアーに **`matuyuhi`** を自動アサイン |

- レビュアー自動アサインは、**`matuyuhi` が当リポジトリのコラボレーター（or 組織メンバー）である**ことが前提。権限が無いと依頼がスキップされる（CIは落とさず警告のみ）。
- 自分（`matuyuhi`）が作成したPRには、GitHub仕様上レビュー依頼できないため自動アサインされない。
- Node バージョンは `.node-version`（24.16.0）を CI / デプロイ双方が参照する。

---

## 3. 非エンジニア向け：作品の追加・編集手順

ブラウザだけで完結する。コマンド操作は不要。

1. `https://fukanojuko.github.io/admin/` を開く
2. ログイン画面で **GitHub Personal Access Token** を貼り付けてログイン
   （トークンの作り方は下記「認証」を参照）
3. 「ゲーム作品」→ **「新規作成」** または既存作品を選んで編集
4. 各項目を入力
   - **タイトル**: 表示名（日本語OK）
   - **URL用ID（slug）**: 英小文字・数字・ハイフンのみ。これが作品URL `…/<slug>/` になる
   - **サムネイル / 概要 / ジャンル / 本文** など
5. **保存（Publish）** すると `main` に直接コミットされ、GitHub Actions が走って **数分で自動公開**される

---

## 4. slug（作品URL）の命名規則

- 使える文字は **英小文字・数字・ハイフン**（`^[a-z0-9-]+$`）
- 例: `battrail` → `https://fukanojuko.github.io/battrail/`
- **既存の作品と重複しないこと**（ファイル名 = URL のため上書きになる）
- 公開後に slug を変えると **URLが変わる**（コンテストに出した固定URLが切れる）。一度公開した作品の slug は変更しない。

---

## 5. コンテンツ・スタイルの構造（エンジニア向け）

### コンテンツ（Markdown）

作品は Markdown 1ファイル = 1作品。ディレクトリ連動でページが動的生成される。

```
src/content/games/<slug>.md   →   /<slug>/  （src/pages/[slug].astro が生成）
```

frontmatter スキーマは `src/content.config.ts` を参照（title / slug / genre / engine / release / summary / thumbnail / links / order / draft）。
`draft: true` の作品は一覧・詳細とも生成されない。

### ページ単位の CSS 介入（エンジニア専用）

非エンジニアは Markdown 本文だけを CMS で編集する。
**デザインを作品ごとに作り込みたい場合は、エンジニアがリポジトリに CSS ファイルを置くだけでよい:**

```
src/styles/games/<slug>.css
```

を作成すると、`/<slug>/` のページにだけ自動で読み込まれる（`src/pages/[slug].astro` が `import.meta.glob` で拾う）。
本文は `<body class="game-<slug>">` / `<article class="detail game-<slug>">` でラップされるので、
**必ず `.game-<slug>` 配下にスコープして書く**（他ページへ波及させない）。雛形: `src/styles/games/battrail.css`（例をコメントアウト済み）。

不要になればその CSS ファイルを削除すればデフォルトに戻る。CMS には露出しないため、非エンジニアが誤って触ることはない。

### サイト全体の設定

団体名・キャッチコピー・OGP等の共通設定は `src/consts.ts`、全体のデザインは `src/layouts/Layout.astro` 内のグローバルCSS（`<style is:global>`）にまとまっている。

### サムネイル画像

`public/images/` に置き、frontmatter には `/images/<file>` の文字列パスで指定する
（Astro の画像最適化は使わず、CMS のアップロード経路を単純化している）。

---

## 6. 認証（初期は PAT 運用）

Sveltia CMS は GitHub backend で動く。初期はサーバー不要の **Personal Access Token** 方式。

1. GitHub → Settings → Developer settings → **Fine-grained tokens** → Generate new token
2. **Repository access**: `fukanojuko/fukanojuko.github.io` のみ
3. **Permissions → Repository permissions → Contents: Read and write**
4. 生成したトークンを `/admin/` のログイン画面に貼る

編集者は `fukanojuko/fukanojuko.github.io` への **書き込み権限**（組織メンバー or collaborator）が必要。

### 将来オプション：OAuth 化（「GitHubでログイン」ボタン）

PAT を都度貼るのをやめ、ボタン1つでログインできるようにする場合は、
OAuth 仲介サーバー [`sveltia-cms-auth`](https://github.com/sveltia/sveltia-cms-auth) を Cloudflare Workers にデプロイし、
`public/admin/config.yml` の `backend` に `base_url` を追加する。**今回はスコープ外**。

---

## 7. 運用上の制約

- Sveltia CMS は**単一ブランチ運用**（`main` 直編集）。投稿ごとのブランチ自動作成・承認フローは未対応。少人数前提。
- CMS が `main` に直コミット → GitHub Actions が走って自動反映、という流れ。

---

## 8. 依存とセキュリティ（`npm audit`）

`package.json` の `overrides` で、ビルド/開発ツールのトランジティブ依存をパッチ版に固定している（`npm audit` を 0 件に保つため）。

- `esbuild`: `^0.28.1`（vite 7 の宣言は `^0.27.0` だが、脆弱性修正版が 0.28.1。ビルド検証済み）
- `yaml`: `^2.9.0`（`@astrojs/check` のエディタ用 language-server 経由）

いずれも**ビルド/開発時のみ**の依存で、デプロイされる静的成果物には含まれない。将来 vite / Astro 本体がこれらのパッチ版に追従したら、この `overrides` は削除してよい（削除後は必ず `npm install && npm audit && npm run build` で確認）。
