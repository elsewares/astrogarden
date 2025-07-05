const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

class SubstackPublisher {
  constructor(config) {
    this.config = {
      headless: false, // Set to true for production
      slowMo: 100, // Slow down actions for better reliability
      timeout: 30000,
      ...config
    };
    this.browser = null;
    this.page = null;
  }

  async init() {
    this.browser = await puppeteer.launch({
      headless: this.config.headless,
      slowMo: this.config.slowMo,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    this.page = await this.browser.newPage();
    await this.page.setViewport({ width: 1366, height: 768 });
    
    // Set longer timeout for all operations
    this.page.setDefaultTimeout(this.config.timeout);
    
    // Listen for console messages (helpful for debugging)
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Browser error:', msg.text());
      }
    });
  }

  async login(email, password) {
    console.log('Navigating to Substack login...');
    await this.page.goto('https://substack.com/sign-in');
    
    // Wait for and fill email
    await this.page.waitForSelector('input[type="email"]');
    await this.page.type('input[type="email"]', email);
    
    // Click continue/next button
    await this.page.click('button[type="submit"]');
    
    // Wait for password field and fill it
    await this.page.waitForSelector('input[type="password"]');
    await this.page.type('input[type="password"]', password);
    
    // Submit login
    await this.page.click('button[type="submit"]');
    
    // Wait for successful login (dashboard or profile page)
    await this.page.waitForNavigation({ waitUntil: 'networkidle2' });
    console.log('Login successful!');
  }

  async navigateToSubstack(substackUrl) {
    console.log(`Navigating to ${substackUrl}...`);
    await this.page.goto(substackUrl);
    
    // Look for "Write" button or similar
    await this.page.waitForSelector('a[href*="/publish"]', { timeout: 10000 });
    await this.page.click('a[href*="/publish"]');
    
    // Wait for the editor to load
    await this.page.waitForSelector('[data-testid="editor"]', { timeout: 15000 });
    console.log('Editor loaded successfully!');
  }

  async createPost(markdownContent, title = null) {
    console.log('Creating new post...');
    
    // Extract title from markdown if not provided
    if (!title) {
      const titleMatch = markdownContent.match(/^#\s+(.+)$/m);
      if (titleMatch) {
        title = titleMatch[1];
        // Remove the title from content since we'll add it separately
        markdownContent = markdownContent.replace(/^#\s+.+$/m, '').trim();
      }
    }
    
    // Fill in the title
    if (title) {
      const titleSelector = 'input[placeholder*="Title"], input[placeholder*="title"], [data-testid="post-title"]';
      await this.page.waitForSelector(titleSelector);
      await this.page.click(titleSelector);
      await this.page.keyboard.selectAll();
      await this.page.type(titleSelector, title);
      console.log(`Title set: ${title}`);
    }
    
    // Find the content editor
    const editorSelector = '[data-testid="editor"] [contenteditable="true"], .ProseMirror, [data-testid="post-content"]';
    await this.page.waitForSelector(editorSelector);
    await this.page.click(editorSelector);
    
    // Convert markdown to rich text by typing it
    // Substack's editor often handles basic markdown automatically
    await this.page.type(editorSelector, markdownContent);
    
    console.log('Content added to editor');
    
    // Wait a moment for any auto-formatting to complete
    await this.page.waitForTimeout(2000);
  }

  async publishPost(publishImmediately = false) {
    console.log('Publishing post...');
    
    if (publishImmediately) {
      // Look for "Publish now" button
      const publishButton = await this.page.$('button:has-text("Publish now"), button[data-testid="publish-button"]');
      if (publishButton) {
        await publishButton.click();
        console.log('Post published immediately!');
      } else {
        console.log('Publish button not found, saving as draft...');
        await this.saveDraft();
      }
    } else {
      await this.saveDraft();
    }
    
    // Wait for confirmation
    await this.page.waitForTimeout(3000);
  }

  async saveDraft() {
    // Look for save/draft button
    const saveButton = await this.page.$('button:has-text("Save draft"), button[data-testid="save-draft"]');
    if (saveButton) {
      await saveButton.click();
      console.log('Post saved as draft!');
    } else {
      // Sometimes saving happens automatically, just wait
      console.log('Auto-save should have saved the draft');
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      console.log('Browser closed');
    }
  }

  async readMarkdownFile(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      console.log(`Markdown file read: ${filePath}`);
      return content;
    } catch (error) {
      throw new Error(`Failed to read markdown file: ${error.message}`);
    }
  }
}

// Main execution function
async function publishToSubstack(config) {
  const publisher = new SubstackPublisher({
    headless: config.headless || false,
    slowMo: config.slowMo || 100
  });

  try {
    await publisher.init();
    
    // Login to Substack
    await publisher.login(config.email, config.password);
    
    // Navigate to the specific Substack
    await publisher.navigateToSubstack(config.substackUrl);
    
    // Read the markdown file
    const markdownContent = await publisher.readMarkdownFile(config.markdownFile);
    
    // Create the post
    await publisher.createPost(markdownContent, config.title);
    
    // Publish or save as draft
    await publisher.publishPost(config.publishImmediately);
    
    console.log('✅ Success! Post has been created on Substack.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await publisher.close();
  }
}

// Example usage
async function main() {
  const config = {
    email: 'brian@elsewares.org', // Your Substack email
    password: 'Substack@Saffah1',
    substackUrl: 'https://anastamosis.substack.com',
    markdownFile: '../content/essays/too-stolen-to-fail.mdx', // Path to your markdown file
    title: null, // Will extract from markdown if not provided
    publishImmediately: false, // Set to true to publish immediately instead of saving as draft
    headless: false, // Set to true to run without GUI
    slowMo: 100 // Milliseconds to slow down actions
  };

  try {
    await publishToSubstack(config);
  } catch (error) {
    console.error('Failed to publish:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { SubstackPublisher, publishToSubstack };
