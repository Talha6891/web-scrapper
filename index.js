import express from 'express';
import path from 'path';
import expressLayouts from 'express-ejs-layouts';
import bodyParser from 'body-parser';
import scrapeImages  from './src/controllers/ScrapperController.js'; 

const app = express();

app.use(bodyParser.urlencoded({ extended: true })); 
app.use(express.static("public"));
app.use('/bootstrap', express.static(path.join('node_modules', 'bootstrap', 'dist')));
app.use('/icons', express.static(path.join('node_modules/bootstrap-icons/font')));

app.set("view engine", "ejs");
app.set("views", path.join("src", "views"));

app.use(expressLayouts);
app.set("layout", "index");

// Home Route
// Home Route
app.get('/', (req, res) => {
  res.render('index', { title: 'Home', success: null, error: null });
});

// Scraping Route
app.post('/scrape', scrapeImages);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
