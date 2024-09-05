import puppeteer from 'puppeteer';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Define the URL to scrape
const url = 'https://www.freepik.com/free-photos-vectors/pakistani-food';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const imagesDir = path.resolve(__dirname, 'images');

// Ensure the images directory exists
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir);
}

(async () => {
  // Launch the browser
  const browser = await puppeteer.launch();
  
  // Open a new page
  const page = await browser.newPage();
  
  // Set a User-Agent
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
  
  // Go to the URL
  await page.goto(url, { waitUntil: 'load' });

  // Extract image URLs
  const imageUrls = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('img')).map(img => img.src);
  });

  // Function to download an image
  const downloadImage = async (url, filename) => {
    const response = await axios({
      url,
      responseType: 'arraybuffer'
    });
    fs.writeFileSync(filename, response.data);
  };

  // Download each image
  for (const imageUrl of imageUrls) {
    // Extract image name from URL
    const imageName = path.basename(new URL(imageUrl).pathname);
    const imagePath = path.resolve(imagesDir, imageName);
    
    try {
      await downloadImage(imageUrl, imagePath);
      console.log(`Downloaded: ${imageUrl}`);
    } catch (error) {
      console.error(`Failed to download ${imageUrl}:`, error.message);
    }
  }

  // Close the browser
  await browser.close();
})();
