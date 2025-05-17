#!/usr/bin/env node

import inquirer from "inquirer";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { exec } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function createSmidgeon() {
  // Get title from user
  const { title } = await inquirer.prompt([
    {
      type: "input",
      name: "title",
      message: "What is the title of your smidgeon?",
      validate: (input) => {
        if (input.trim() === "") {
          return "Title cannot be empty";
        }
        return true;
      },
    },
  ]);

  // Create filename
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric chars with hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens

  const filename = `${year}-${month}-${slug}.mdx`;

  // Create frontmatter
  const frontmatter = `---
title: "${title}"
startDate: ${date.toISOString()}
type: "thread"
---

`;

  // Write file directly in threads directory
  const threadsDir = path.join(
    __dirname,
    "..",
    "src",
    "content",
    "threads",
  );
  const filePath = path.join(threadsDir, filename);
  await fs.writeFile(filePath, frontmatter);

  console.log(`Created new smidgeon at: ${filePath}`);

  // Open in VS Code
  exec(`code ${filePath}`, (error) => {
    if (error) {
      console.error("Could not open file in VS Code:", error);
    }
  });
}

createSmidgeon().catch(console.error);
