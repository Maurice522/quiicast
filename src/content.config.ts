import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    // Search-result variants kept short enough not to be truncated (~60 / ~155
    // chars); the long title/description stay for the on-page heading and cards.
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.string().default('QuiiCast Team'),
    image: z.string(),
    imageAlt: z.string(),
    tags: z.array(z.string()).default([])
  })
});

export const collections = { blog };
