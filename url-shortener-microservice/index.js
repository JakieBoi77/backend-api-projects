require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});


// Database Connection
mongoose.connect(process.env.DATABASE_URI)
  .then(() => console.log("Connected to Database"))
  .catch(err => console.error("Database connection error:", err));

// Body-Parsing Middleware
app.use("/api/shorturl", bodyParser.urlencoded({extended: false}));

// Short URL Schema
const shortUrlSchema = new mongoose.Schema({
  url: String
});

// Short URL Model
const ShortURL = mongoose.model("short-urls", shortUrlSchema);

// POST Short URL
app.post("/api/shorturl", async (req, res) => {
  try {
    // Create a URL from the Request Body
    const url = new URL(req.body.url);

    // Protocol must be HTTP or HTTPS
    if (url.protocol === "http:" || url.protocol === "https:") {
      // Query the database for the URL
      let record = await ShortURL.findOne({ url: url.href });

      // If the record does not exist
      if (!record) {
        // Add URL to Database
        const shortURL = new ShortURL({ url: url.href });
        await shortURL.save();
        console.log("Sucessfully saved to database: " + url.href);
        // Update the record
        record = await ShortURL.findOne({ url: url.href });
      } else {
        console.log("URL already in database: " + url.href);
      }
      
      // Send back the short URL data
      res.json({ "original_url": record.url, "short_url": record._id });
    } else {
      throw new Error("Invalid Protocol");
    }

  } catch (err) {
    console.log("Invalid URL: " + req.body.url);
    res.json({ "error": "invalid url" });
  }
});

// GET Short URL
app.get("/api/shorturl/:short_url", async (req, res) => {
  try {
    // Get the record
    const record = await ShortURL.findById(req.params.short_url);

    // Redirect
    res.redirect(record.url);
  } catch (err) {
    console.error(err);
  }
});
