import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// glob loader を使う。ファイル名 = entry id = slug = URL になる。
//   src/content/games/slime-vs-mushroom.md  →  /slime-vs-mushroom/
// サムネイルは CMS 連携を優先し、public/images 配下の文字列パスで扱う
// （Astro の image() 最適化は今回は使わず、非エンジニアのアップロード経路を単純化する）。
const games = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/games' }),
  schema: z.object({
    title: z.string(), // 表示名（日本語OK）
    slug: z.string(), // URL用（英小文字・数字・ハイフン）。ファイル名と一致させる
    genre: z.string().optional(),
    engine: z.string().optional(),
    release: z.string().optional(), // 例: "2026-03"
    summary: z.string().optional(),
    thumbnail: z.string().optional(), // 例: "/images/slime-vs-mushroom.png"
    links: z
      .object({
        store: z.string().optional(),
        site: z.string().optional(),
        x: z.string().optional(),
      })
      .partial()
      .optional(),
    order: z.number().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { games };
