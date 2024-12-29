import rss from "@astrojs/rss";
import { getCollection } from "astro:content";

export async function GET(context) {
  const notes = await getCollection("notes", ({ data }) => !data.draft);
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
        pubDate: post.data.startDate,
        description: post.data.description,
        link: `/${post.id}/`,
      })),
      ...essays.map((post) => ({
        title: post.data.title,
        pubDate: post.data.startDate,
        description: post.data.description,
        link: `/${post.id}/`,
      })),
      ...talks.map((post) => ({
        title: post.data.title,
        pubDate: post.data.startDate,
        description: post.data.description,
        link: `/${post.id}/`,
      })),
      ...patterns.map((post) => ({
        title: post.data.title,
        pubDate: post.data.startDate,
        description: post.data.description,
        link: `/${post.id}/`,
      })),
    ].sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf()),
    customData: `<language>en-us</language>`,
  });
}
