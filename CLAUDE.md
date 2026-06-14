# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト

ゲーム制作団体 fukanojuko の GitHub Pages サイト（<https://fukanojuko.github.io/>）。**作品・デザイン・制作メモ**を発信する。Astro 6 静的サイト ＋ Sveltia CMS ＋ GitHub Actions → GitHub Pages。
組織の `<org>.github.io` 特別リポなので **`astro.config.mjs` に `base` は設定しない**（`site` のみ。公開は `/` 直下）。

人向けの詳細手順（CMS編集・認証・Pages設定など）は `CONTRIBUTING.md` を参照。

## コマンド

Node **≥22.12**（Astro 6 の要件）。`.node-version` で **24.16.0** に固定。
この環境の fnm デフォルトは Node 20.x のため、コマンドは Node 24 で実行する（シェルが `.node-version` を自動適用するなら `fnm exec` は不要）:

```bash
fnm exec --using=24.16.0 -- npm install
fnm exec --using=24.16.0 -- npm run dev     # http://localhost:4321/
fnm exec --using=24.16.0 -- npm run build   # dist/ に静的出力
fnm exec --using=24.16.0 -- npm run check   # astro check（型 + コンテンツスキーマ検証）
```

依存は npm 管理。`package.json` の `overrides` で `esbuild ^0.28.1` / `yaml ^2.9.0` をパッチ版に固定し `npm audit` を 0 件に保っている（どちらもビルド/開発ツールのみ）。**`npm audit fix --force` は使わない**（Astro 6→2 へのダウングレードという壊れた提案を出す）。

## アーキテクチャ

### コンテンツ → ページの対応

3つの Content Collection（glob loader）。**ファイル名 = entry id = slug = URL セグメント**。

```
src/content/works/<slug>.md    → /works/<slug>/     作品（コンテスト提出用の固定URL）
src/content/designs/<slug>.md  → /designs/<slug>/   デザインラフ/WIP（画像ギャラリー）
src/content/notes/<slug>.md    → /notes/<slug>/     制作メモ/devlog
```

- スキーマは `src/content.config.ts`。`date` は `z.coerce.date()`（YAML の日付/文字列どちらでも受ける。**`z.string()` にしないこと**＝YAMLが日付をDate化して壊れる）。`draft: true` は生成除外。
- 各セクションは `index.astro`（一覧）＋ `[slug].astro`（詳細）。トップ `src/pages/index.astro` は3セクションのハブ。
- サムネ・画像は `public/images/` に置き、frontmatter には `/images/<file>` の文字列パスで指定（Astro の画像最適化は不使用＝CMSアップロードを単純化）。

### セクション（用途）の追加 — 複数ファイルにまたがる

1. `src/consts.ts` の `SECTIONS` に追記（ヘッダーナビ＆トップのハブはここ起点）
2. `src/content/<key>/` を作成（空なら `.gitkeep`）
3. `src/content.config.ts` にスキーマ追加し `collections` に登録
4. `src/pages/<key>/index.astro` と `[slug].astro` を追加（既存セクションをコピーして調整）
5. CMS に出すなら `public/admin/config.yml` の `collections` に1ブロック追加

### ページ単位のCSS介入（エンジニア専用）

`src/styles/<section>/<slug>.css` を置くと、その詳細ページにだけ raw 注入される（各 `[slug].astro` の `import.meta.glob('../../styles/<section>/*.css', { query: '?raw', eager: true })`）。本文は `<body>` / `<article>` に **`<section>-<slug>`**（単数形: `work` / `design` / `note`）クラスが付くので、CSSは必ず `.<section>-<slug>` 配下にスコープする。例: `src/styles/works/battrail.css`。CMS には露出しない。

### CMS とブランチ運用（重要・直感に反する）

Sveltia CMS は `/admin`（`public/admin/`）から編集。**コミット先は `main` ではなく `content` ブランチ**（`config.yml` の `backend.branch`）。Sveltia は `editorial_workflow`（投稿ごとPR）が未実装のため、以下で代替している:

```
CMS保存 → content にコミット → cms-pr.yml が content→main のPRを自動生成（matuyuhi をreviewer）
→ ci.yml がビルド検証 → マージ → deploy.yml で公開
```

`content` は `content-branch.yml` が自動維持する（削除されても `main` から再作成、既存があれば上書きしない）。
→ **CMS由来のコンテンツを `main` に直接コミットしない**。`content` ブランチが存在するのは正常（消してよい＝自動復活する）。

### GitHub Actions（`.github/workflows/`）

| ファイル | トリガー | 役割 |
| --- | --- | --- |
| `deploy.yml` | `main` push / 手動 | `withastro/action` でビルド → Pages 公開（Node 24、`base` なし） |
| `ci.yml` | PR(→`main`) / `content` push / 手動 | `check` ＋ `build`（デプロイなし）。`content` 検証は自動PRのチェックとして表示 |
| `cms-pr.yml` | `content` push | `content`→`main` PR 自動生成 ＋ `matuyuhi` をreviewer指定 |
| `content-branch.yml` | `content` delete / `main` push | `content` を `main` から再作成（無ければ） |
| `pr-reviewer.yml` | PR open/reopen/ready | 人が作るPRに `matuyuhi` を自動アサイン |

自動生成PRは `GITHUB_TOKEN` 製のため `pull_request` 系（`pr-reviewer.yml` / `ci.yml` の `pull_request`）は発火しない。よって `cms-pr.yml` でreviewerを指定し、ビルド検証は `ci.yml` の `content` push トリガで担保している。
