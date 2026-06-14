// @ts-check
import { defineConfig } from 'astro/config';

// 組織アカウントの特別リポ（<org>.github.io）なので base は設定しない。
// 公開URLは https://fukanojuko.github.io/ 直下、作品URLは /<slug>/ で固定される。
export default defineConfig({
  site: 'https://fukanojuko.github.io',
});
