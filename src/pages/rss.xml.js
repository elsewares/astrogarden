import rss from "@astrojs/rss";
import { getCollection } from "astro:content";

export async function GET(context) {
  const notes = await getCollection("notes", ({ data }) => !data.draft);
  const now = await getCollection("now", ({ data }) => !data.draft);
  const essays = await getCollection("essays", ({ data }) => !data.draft);
  const talks = await getCollection("talks", ({ data }) => !data.draft);
  const patterns = await getCollection("patterns", ({ data }) => !data.draft);

  return rss({
    title: "Maggie Appleton",
    description: "Essays on programming, design, and anthropology",
    site: context.site,
    items: [
      ...notes.map((post) => ({
        title: post.data.title,
        pubDate: post.data.updated || post.data.published,
        description: post.data.description,
        link: `/${post.slug}/`,
      })),
      ...now.map((post) => ({
        title: `Now update – ${post.slug}`,
        pubDate: post.data.updated || post.data.published,
        description: "Life updates and current interests",
        link: `/now/`,
      })),
      ...essays.map((post) => ({
        title: post.data.title,
        pubDate: post.data.updated || post.data.startDate,
        description: post.data.description,
        link: `/${post.slug}/`,
      })),
      ...talks.map((post) => ({
        title: post.data.title,
        pubDate: post.data.updated || post.data.startDate,
        description: post.data.description,
        link: `/${post.slug}/`,
      })),
      ...patterns.map((post) => ({
        title: post.data.title,
        pubDate: post.data.updated || post.data.startDate,
        description: post.data.description,
        link: `/${post.slug}/`,
      })),
    ].sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf()),
    customData: `<language>en-us</language>`,
  });
}
