import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs";
import dotenv from "dotenv";
import { algoliasearch } from "algoliasearch";
import { globby } from "globby";
import matter from "gray-matter";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const CONTENT_PATH = join(__dirname, "..", "content");

// Get all content collections
async function getAllContent() {
	const contentTypes = ["essays", "notes", "patterns", "talks", "podcasts"];
	let allContent = [];

	for (const type of contentTypes) {
		const contentPath = join(CONTENT_PATH, type);
		if (!fs.existsSync(contentPath)) continue;

		const files = await globby(["*.mdx", "*.md"], { cwd: contentPath });

		const content = files
			.map((file) => {
				const source = fs.readFileSync(join(contentPath, file), "utf8");
				const { data, content } = matter(source);

				// Skip draft posts
				if (data.draft) return null;

				return {
					slug: file.replace(/\.(mdx?|json)$/, ""),
					data,
					body: content,
				};
			})
			.filter(Boolean); // Remove null values (drafts)

		allContent = [...allContent, ...content];
	}

	return allContent;
}

function transformPostsToSearchObjects(posts) {
	const transformed = posts.map((post) => {
		const postId = post.data.title.toLowerCase().replace(/\s/g, "-");

		const transformedPost = {
			objectID: postId,
			slug: post.slug,
			title: post.data.title,
			description: post.data.description,
			startDate: post.data.startDate,
			updated: post.data.updated,
			cover: post.data.cover,
			topics: post.data.topics,
			growthStage: post.data.growthStage,
			type: post.data.type,
			content: post.body,
		};

		if (post.data.type === "talk" && post.data.conferences) {
			transformedPost.conferences = post.data.conferences;
		}

		return transformedPost;
	});

	return transformed;
}

(async function () {
	dotenv.config();

	try {
		const posts = await getAllContent();
		const searchObjects = transformPostsToSearchObjects(posts);

		const appID = process.env.PUBLIC_ALGOLIA_APP_ID;
		const adminKey = process.env.ALGOLIA_SEARCH_ADMIN_KEY;

		// Make sure we have the credentials
		if (!appID || !adminKey) {
			throw new Error("Missing Algolia credentials in .env file");
		}

		// Create the client
		const client = algoliasearch(appID, adminKey);

		// Initialize the index
		const index = client.initIndex("garden-posts");

		const algoliaResponse = await index.saveObjects(searchObjects);

		console.log(
			`🎉 Successfully added ${
				algoliaResponse.objectIDs.length
			} records to Algolia search. Object IDs:\n${algoliaResponse.objectIDs.join(
				"\n"
			)}`
		);
	} catch (error) {
		console.error("Failed to upload to Algolia:", error);
		console.error("Error details:", error.message);
		if (error.debugData) {
			console.error("Debug data:", error.debugData);
		}
	}
})();
