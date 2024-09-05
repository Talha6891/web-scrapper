import puppeteer from 'puppeteer';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Helper function to scrape images
const scrapeImages = async (req, res) => {
    
    // Define the current directory and images directory
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const imagesDir = path.resolve(__dirname, '../../public/images'); 

    // Ensure the images directory exists
    if (!fs.existsSync(imagesDir)) {
        fs.mkdirSync(imagesDir);
    }

    try {
        // Launch Puppeteer
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        await page.goto(req.body.url, { waitUntil: 'load' });

        // Extract image URLs from the page
        const imageUrls = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('img')).map(img => img.src);
        });

        // Download and save images
        for (const imageUrl of imageUrls) {
            const imageName = path.basename(new URL(imageUrl).pathname);
            const imagePath = path.resolve(imagesDir, imageName);

            try {
                const response = await axios({
                    url: imageUrl,
                    responseType: 'arraybuffer'
                });
                fs.writeFileSync(imagePath, response.data);
                console.log(`Downloaded: ${imageUrl}`);
            } catch (error) {
                console.error(`Failed to download ${imageUrl}:`, error.message);
            }
        }

        // Close the browser
        await browser.close();

        // Send success message to the view
        res.render('index', { title: 'Home', success: 'Images have been successfully scraped!', error: null });

    } catch (error) {
        console.error(`Error while scraping images: ${error.message}`);
        res.render('index', { title: 'Home', success: null, error: 'Failed to scrape images.' });
    }
};

export default scrapeImages;