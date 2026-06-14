# CONTRIBUTING

fukanojuko.github.io の編集・開発ガイド。

- コンテンツを足すだけの人（非エンジニア）→ [2. コンテンツ編集](#2-コンテンツ編集非エンジニア向け)
- ローカルで開発する人（エンジニア）→ [1. ローカル開発](#1-ローカル開発) 以降

技術: Astro 6（Content Collections）＋ Sveltia CMS（Git-backed の編集UI）＋ GitHub Actions → GitHub Pages。
`base` は設定しない（`<org>.github.io` の特別リポのため、公開は `https://fukanojuko.github.io/` 直下）。

---

## 1. ローカル開発

Node.js は **22.12 以上**（推奨 24 LTS / Astro 6 の要件）。リポジトリ直下の `.node-version`（`24.16.0`）を fnm / nvm 等が読んで自動で切り替える。パッケージマネージャは npm（pnpm / bun でも可・lockfile に合わせる）。

```bash
npm install      # 依存をインストール
npm run dev      # 開発サーバ（http://localhost:4321/）
npm run build    # 本番ビルド（出力は dist/）
npm run preview  # ビルド結果をローカル確認
npm run check    # 型・コンテンツのチェック
```

---

## 2. コンテンツ編集（非エンジニア向け）

ブラウザだけで完結する。コマンド操作は不要。

1. `https://fukanojuko.github.io/admin/` を開く
2. ログイン画面で **GitHub Personal Access Token** を貼り付けてログイン（→ [8. 認証](#8-認証初期は-pat-運用)）
3. 左メニューから編集したい種類を選ぶ
   - **作品** … 完成・開発中の作品紹介（コンテスト提出用URL）
   - **デザイン** … デザインラフ・WIP の共有
   - **制作メモ** … 制作の記録・devlog
4. **「新規作成」** または既存項目を選び、各フィールドを入力
   - **タイトル**: 表示名（日本語OK）
   - **URL用ID（slug）**: 英小文字・数字・ハイフンのみ。これがURLになる（→ [3. slug](#3-slug-作品urlの命名規則)）
   - 画像（サムネ・ギャラリー）はその場でアップロードできる（保存先は `public/images`）
5. **保存（Publish）** すると `main` に直接コミットされ、GitHub Actions が走って **数分で自動公開**される

---

## 3. slug（作品URL）の命名規則

- 使える文字は **英小文字・数字・ハイフン**（`^[a-z0-9-]+$`）。CMS側でも入力チェックされる。
- URL は種類ごとに以下のようになる:
  - 作品: `https://fukanojuko.github.io/works/<slug>/`（例 `/works/battrail/`）
  - デザイン: `/designs/<slug>/`
  - 制作メモ: `/notes/<slug>/`
- 同じ種類の中で **slug を重複させない**（ファイル名 = URL のため上書きになる）。
- 公開後に slug を変えると **URLが変わる**（コンテストに出した固定URLが切れる）。一度公開した作品の slug は変更しない。

---

## 4. コンテンツ構造（エンジニア向け）

3つの Content Collection があり、各コレクションは Markdown 1ファイル = 1項目。ディレクトリ連動でページが動的生成される。

```
src/content/works/<slug>.md    →  /works/<slug>/    （src/pages/works/[slug].astro）
src/content/designs/<slug>.md  →  /designs/<slug>/  （src/pages/designs/[slug].astro）
src/content/notes/<slug>.md    →  /notes/<slug>/    （src/pages/notes/[slug].astro）
```

- スキーマ（frontmatter の型）は `src/content.config.ts`。`date` は `z.coerce.date()` なので YAML の日付/文字列どちらでも受ける。
- 一覧・トップの表示は `src/pages/**/index.astro` と `src/components/*Card.astro` / `NoteItem.astro`。
- 共通レイアウト・全体のデザインは `src/layouts/Layout.astro`（グローバルCSS `<style is:global>`）。
- 団体名・タグライン・ヘッダーナビの項目は `src/consts.ts`（`SITE_TITLE` / `SITE_TAGLINE` / `SECTIONS`）。
- `draft: true` の項目は一覧・詳細とも生成されない。
- サムネ・画像は `public/images/` に置き、frontmatter には `/images/<file>` の文字列パスで指定する（Astro の画像最適化は使わず、CMSのアップロード経路を単純化）。

### 新しいセクション（用途）を増やす

例として `events`（イベント情報）を足す場合:

1. `src/consts.ts` の `SECTIONS` に `{ key: 'events', label: 'イベント', path: '/events/', description: '…' }` を追記
2. `src/content/events/` を作成（中身が空のうちは `.gitkeep` を置く）
3. `src/content.config.ts` に `events` コレクションのスキーマを追加し、`collections` に登録
4. `src/pages/events/index.astro` と `src/pages/events/[slug].astro` を追加（既存セクションをコピーして調整）
5. CMS に出すなら `public/admin/config.yml` の `collections` に1ブロック追加

---

## 5. ページ単位のCSS介入（エンジニア専用）

非エンジニアは Markdown 本文だけを CMS で編集する。デザインを項目ごとに作り込みたい場合は、エンジニアがリポジトリに CSS ファイルを置くだけでよい:

```
src/styles/works/<slug>.css     （作品ページ用）
src/styles/designs/<slug>.css   （デザインページ用）
src/styles/notes/<slug>.css     （メモページ用）
```

を作成すると、その詳細ページにだけ自動で読み込まれる（各 `[slug].astro` が `import.meta.glob` で拾う）。
本文は `<body class="<section>-<slug>">` / `<article class="detail <section>-<slug>">` でラップされるので、
**必ず `.<section>-<slug>` 配下にスコープして書く**（他ページへ波及させない）。

例: 作品 battrail なら `.work-battrail { … }`。雛形 `src/styles/works/battrail.css`（例をコメントアウト済み）を参照。
不要になればその CSS ファイルを削除すればデフォルトに戻る。CMS には露出しないため、非エンジニアが誤って触ることはない。

> スコープのプレフィックスは `works`→`work` / `designs`→`design` / `notes`→`note`（単数形）。

---

## 6. GitHub Actions（`.github/workflows/`）

| ワークフロー | トリガー | 内容 |
| --- | --- | --- |
| `deploy.yml` | `main` への push / 手動 | ビルドして GitHub Pages に公開 |
| `ci.yml` | PR（→ `main`）/ 手動 | `npm run check` ＋ `npm run build` を検証（**デプロイはしない**） |
| `pr-reviewer.yml` | PRが open / reopen / draft解除 | レビュアーに **`matuyuhi`** を自動アサイン |

- レビュアー自動アサインは **`matuyuhi` が当リポジトリのコラボレーター（or 組織メンバー）である**ことが前提。権限が無いと依頼はスキップされる（CIは落とさず警告のみ）。
- 自分（`matuyuhi`）が作成したPRには、GitHub仕様上レビュー依頼できないため自動アサインされない。
- fork からのPRは `pull_request` のトークンが read-only になり依頼が失敗する（同一リポのブランチ運用前提）。
- Node バージョンは `.node-version`（24.16.0）を CI / デプロイ双方が参照する。

---

## 7. GitHub Pages の有効化（初回のみ・手動）

リポジトリの **Settings → Pages → Build and deployment → Source** を **「GitHub Actions」** に設定する。
（Source が「Deploy from a branch」のままだと Actions のデプロイが反映されない）

---

## 8. 認証（初期は PAT 運用）

Sveltia CMS は GitHub backend で動く。初期はサーバー不要の **Personal Access Token** 方式。

1. GitHub → Settings → Developer settings → **Fine-grained tokens** → Generate new token
2. **Repository access**: `fukanojuko/fukanojuko.github.io` のみ
3. **Permissions → Repository permissions → Contents: Read and write**
4. 生成したトークンを `/admin/` のログイン画面に貼る

編集者は `fukanojuko/fukanojuko.github.io` への **書き込み権限**（組織メンバー or collaborator）が必要。

### 将来オプション：OAuth 化（「GitHubでログイン」ボタン）

PAT を都度貼るのをやめる場合は、OAuth 仲介サーバー [`sveltia-cms-auth`](https://github.com/sveltia/sveltia-cms-auth) を Cloudflare Workers にデプロイし、`public/admin/config.yml` の `backend` に `base_url` を追加する。**今回はスコープ外**。

---

## 9. 依存とセキュリティ（`npm audit`）

`package.json` の `overrides` で、ビルド/開発ツールのトランジティブ依存をパッチ版に固定している（`npm audit` を 0 件に保つため）。

- `esbuild`: `^0.28.1`（vite 7 の宣言は `^0.27.0` だが、脆弱性修正版が 0.28.1。ビルド検証済み）
- `yaml`: `^2.9.0`（`@astrojs/check` のエディタ用 language-server 経由）

いずれも**ビルド/開発時のみ**の依存で、デプロイされる静的成果物には含まれない。将来 vite / Astro 本体がパッチ版に追従したら、この `overrides` は削除してよい（削除後は必ず `npm install && npm audit && npm run build` で確認）。

---

## 10. 運用上の制約

- Sveltia CMS は**単一ブランチ運用**（`main` 直編集）。投稿ごとのブランチ自動作成・承認フローは未対応。少人数前提。
- CMS が `main` に直コミット → GitHub Actions が走って自動反映、という流れ。
