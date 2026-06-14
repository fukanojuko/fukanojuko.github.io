// サイト全体の表示設定。団体名・タグライン・セクションはここを編集する。
export const SITE_TITLE = 'fukanojuko'; // ← 団体の表示名に変更してください（日本語OK）
export const SITE_TAGLINE = '作品・デザイン・制作メモ';
export const SITE_DESCRIPTION =
  'ゲーム制作団体 fukanojuko の作品紹介・デザイン・制作メモ。';
export const SITE_URL = 'https://fukanojuko.github.io';

// ヘッダーナビ・トップページのセクション定義。
// 新しい用途を増やすときは (1) ここに追記 (2) src/content/<key>/ を作成
// (3) src/content.config.ts にスキーマ追加 (4) src/pages/<key>/ にページ追加。
export const SECTIONS = [
  {
    key: 'works',
    label: '作品',
    path: '/works/',
    description: '完成・開発中の作品紹介（コンテスト提出用の固定URL）',
  },
  {
    key: 'designs',
    label: 'デザイン',
    path: '/designs/',
    description: 'デザインラフ・WIP の共有',
  },
  {
    key: 'notes',
    label: '制作メモ',
    path: '/notes/',
    description: '制作の記録・メモ',
  },
] as const;

// 日付（Date）を表示用の "YYYY-MM-DD" 文字列に整形する。
export function formatDate(date?: Date): string {
  if (!date) return '';
  return date.toISOString().slice(0, 10);
}
