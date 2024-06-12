// index.js
// where your node app starts

// init project
var express = require('express');
var app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
var cors = require('cors');
app.use(cors({optionsSuccessStatus: 200}));  // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});


// Date Endpoint
app.get("/api/:date", (req, res) => {

  // If input is a date string
  if (!isNaN(new Date(req.params.date).getTime())) {
    date = new Date(req.params.date);
    res.json({
      "unix": date.getTime(),
      "utc": date.toUTCString()
    });
  }

  // If input is a numeric string
  else if (!isNaN(req.params.date)) {
    date = new Date(parseInt(req.params.date));
    res.json({
      "unix": date.getTime(),
      "utc": date.toUTCString()
    });
  }

  // Invalid input
  else {
    res.json({
      "error": "Invaid Date"
    });
  }
  
});



// Listen on port set in environment variable or default to 3000
var listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
