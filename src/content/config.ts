import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const notesCollection = defineCollection({
	loader: glob({ pattern: "**/*.mdx", base: "./src/content/notes" }),
	schema: () =>
		z.object({
			title: z.string(),
			description: z.string(),
			aliases: z.array(z.string()).optional(),
			startDate: z.coerce.date(),
			updated: z.coerce.date(),
			type: z.literal("note"),
			topics: z.array(z.string()).optional(),
			growthStage: z.string(),
			draft: z.boolean().optional(),
		}),
});

const essaysCollection = defineCollection({
	loader: glob({ pattern: "**/*.mdx", base: "./src/content/essays" }),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			updated: z.coerce.date(),
			startDate: z.coerce.date(),
			type: z.literal("essay"),
			cover: image(),
			topics: z.array(z.string()),
			growthStage: z.string(),
			featured: z.boolean().optional(),
			draft: z.boolean().optional(),
		}),
});

const patternsCollection = defineCollection({
	loader: glob({ pattern: "**/*.mdx", base: "./src/content/patterns" }),
	schema: () =>
		z.object({
			title: z.string(),
			description: z.string(),
			updated: z.coerce.date(),
			startDate: z.coerce.date(),
			type: z.literal("pattern"),
			topics: z.array(z.string()),
			growthStage: z.string(),
			draft: z.boolean().optional(),
		}),
});

const talksCollection = defineCollection({
	loader: glob({ pattern: "**/*.mdx", base: "./src/content/talks" }),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			updated: z.coerce.date(),
			type: z.literal("talk"),
			topics: z.array(z.string()),
			growthStage: z.string(),
			conferences: z.array(
				z.object({
					name: z.string(),
					date: z.string(),
					location: z.string(),
				})
			),
			cover: image(),
			draft: z.boolean().optional(),
		}),
});

// const podcastsCollection = defineCollection({
// 	type: "data",
// 	schema: () =>
// 		z.object({
// 			// to do
// 		}),
// });

// This key should match your collection directory name in "src/content"
export const collections = {
	notes: notesCollection,
	essays: essaysCollection,
	patterns: patternsCollection,
	talks: talksCollection,
};
