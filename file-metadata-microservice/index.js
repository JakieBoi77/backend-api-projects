const express = require('express');
const multer = require('multer');
const cors = require('cors');
require('dotenv').config()

var app = express();

app.use(cors());
app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log('Your app is listening on port ' + port)
});

// Storage Engine
const storage = multer.memoryStorage();

// Initialize Upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 }
});

// File Analyzer Endpoint
app.post("/api/fileanalyse", upload.single("upfile"), (req, res) => {
  const fileInfo = {
    name: req.file.originalname,
    type: req.file.mimetype,
    size: req.file.size
  }
  res.json(fileInfo);
});