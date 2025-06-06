#!/usr/bin/env node

import inquirer from "inquirer";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONTENT_PATH = path.join(__dirname, "..", "content", "notes");

async function createNote() {
  // Get title from input
  const { title, description } = await inquirer.prompt([
    {
      type: "input",
      name: "title",
      message: "What is the title of your note?",
      validate: (input) => {
        if (input.trim() === "") {
          return "Title cannot be empty";
        }
        return true;
      },
    },
    {
      type: "input",
      name: "description",
      message: "What is the description of your note?",
      validate: (input) => {
        if (input.trim() === "") {
          return "Description cannot be empty";
        }
        return true;
      },
    },
  ]);
  
  // Create filename
  const date = new Date();
  const epoch = date.getTime();
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric chars with hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
  
  const filename = `${slug}-${epoch}.mdx`;
  
  // Create frontmatter
  const frontMatter = `---
title: "${title}"
description: "${description}"
startDate: "${new Date().toDateString()}"
updated: "${new Date().toDateString()}"
cover: "@images/bacterium@2x.png" // Default cover image
topics: []
aliases: []
type: "note"
growthStage: "spore"
---

`;
  
  // Ensure year directory exists
  await fs.mkdir(CONTENT_PATH, { recursive: true });
  
  // Write file
  const filePath = path.join(CONTENT_PATH, filename);
  await fs.writeFile(filePath, frontMatter);
  
  console.log(`Created new note at: ${filePath}`);
}

createNote().catch(console.error);
