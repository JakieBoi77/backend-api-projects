const express = require('express');
const mongoose = require('mongoose');
const app = express();
const cors = require('cors');
require('dotenv').config();

app.use(cors());
app.use(express.static('public'));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});


// Database Connection
mongoose.connect(process.env.DATABASE_URI)
  .then(() => console.log("Database Connected"))
  .catch(err => console.error("Database connection error: " + err));

// Body-Parsing Middleware
app.use("/api/shorturl", bodyParser.urlencoded({extended: false}));
