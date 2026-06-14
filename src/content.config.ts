import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// 各コレクションとも glob loader。ファイル名 = entry id = slug = URL。
//   src/content/works/battrail.md  →  /works/battrail/
// サムネ・画像は CMS 連携を優先し public/images 配下の文字列パスで扱う。

// 作品（コンテスト提出用の固定URL）
const works = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/works' }),
  schema: z.object({
    title: z.string(), // 表示名（日本語OK）
    slug: z.string(), // URL用（英小文字・数字・ハイフン）。ファイル名と一致させる
    genre: z.string().optional(),
    engine: z.string().optional(),
    release: z.string().optional(), // 例: "2026-03"
    summary: z.string().optional(),
    thumbnail: z.string().optional(), // 例: "/images/battrail.png"
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

// デザインラフ・WIP の共有（画像中心）
const designs = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/designs' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    summary: z.string().optional(),
    date: z.coerce.date().optional(), // YAMLの日付/文字列どちらでも受ける
    status: z.string().optional(), // 例: "ラフ" / "WIP" / "確定"
    work: z.string().optional(), // 関連する作品の slug（任意）
    thumbnail: z.string().optional(),
    images: z.array(z.string()).optional(), // ギャラリー
    tags: z.array(z.string()).optional(),
    order: z.number().optional(),
    draft: z.boolean().default(false),
  }),
});

// 制作メモ・devlog（テキスト中心）
const notes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/notes' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    date: z.coerce.date().optional(), // YAMLの日付/文字列どちらでも受ける
    summary: z.string().optional(),
    tags: z.array(z.string()).optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { works, designs, notes };
