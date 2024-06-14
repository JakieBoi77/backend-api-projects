const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
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
  .catch(err => console.error("Database connection error:", err));

// Body-Parsing Middleware
app.use("/api", bodyParser.urlencoded({extended: false}));

// User Model
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  }
}, {versionKey: false});
const User = mongoose.model("users", userSchema);

// Exercise Model
const exerciseSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  date: Date
}, {versionKey: false});
const Exercise = mongoose.model("exercises", exerciseSchema);


// Users Path
app.route("/api/users")
  // POST /api/users
  .post(async (req, res) => {
    try {
      // Get info
      const username = req.body.username;

      // Username is required
      if (username === "") {
        return res.json({ error: "The username field is required."})
      }

      // Look in the database for the user
      let user = await User.findOne({ username });
      
      // Add user if not found
      if (!user) {
        newUser = new User({ username });
        const savedUser = await newUser.save();
        user = savedUser;
      }

      // Send back the user data
      res.json({ username: user.username, _id: user._id });

    } catch (err) {
      console.error("Error in POST /api/users:", err);
      res.json({ error: "Internal server error" });
    }
  })
  // GET /api/users
  .get(async (req, res) => {
    try {
      // Get users
      const userList = await User.find({});
      res.json(userList);

    } catch (err) {
      console.error("Error in GET /api/users:", err);
      res.json({ error: "Interal server error" });
    }
    
  });

// POST /api/users/:_id/exercises
app.route("/api/users/:_id/exercises")
  .post(async (req, res) => {
    try {
      // Get Info
      let userId = req.params._id;
      let description = req.body.description;
      let duration = req.body.duration;
      let date = req.body.date;

      // UserID is required
      if (userId === "") {
        return res.json({ error: "The ID field is required."})
      }

      // Verify id and get username
      const user = await User.findById(userId);
      if (!user) {
        return res.json({ error: "User does not exist." });
      }
      const username = user.username;

      // Description is required
      if (description === "") {
        return res.json({ error: "The description field is required." });
      }

      // Duration is required
      if (duration === "") {
        return res.json({ error: "The duration field is required." });
      }

      // Verify and convert duration
      if (isNaN(parseInt(duration))) {
        return res.json({ error: "Duration is not a number." })
      }
      duration = Number(duration);

      // Convert date string to date obj
      date = convertDate(date);

      // Add exercise to the database
      const newExercise = new Exercise({ userId, username, description, duration, date });
      const savedExercise = await newExercise.save();

      // Send exercise data back to the user
      res.json({
        _id: userId,
        username,
        date: date.toDateString(),
        duration,
        description
      });

    } catch (err) {
      console.error("Error in POST /api/users/:_id/excercises:", err);
      res.json({ error: "Interal server error" });
    }
  });

// GET /api/users/:_id/logs?[from][&to][&limit]
app.route("/api/users/:_id/logs")
  .get(async (req, res) => {
    try { 
      // UserID is required
      let userId = req.params._id;
      if (userId === "") {
        return res.json({ error: "The ID field is required."})
      }

      // Verify id and get username
      const user = await User.findById(userId);
      if (!user) {
        return res.json({ error: "User does not exist." });
      }
      const username = user.username;

      // Get Query Parameters
      let from = req.query.from;
      let to = req.query.to;
      let limit = req.query.limit;

      // Get requested exercises
      let exercises = await Exercise.find({ userId });;
      if ( from || to ) {
        from = convertDate(from);
        to = convertDate(to);
        if (limit) {
          limit = parseInt(limit);
          exercises = await Exercise.find({ userId, date: { $gte: from, $lte: to }}).limit(limit);
        } else {
          exercises = await Exercise.find({ userId, date: { $gte: from, $lte: to }});
        }
      } else if (limit) {
        limit = parseInt(limit);
        exercises = await Exercise.find({ userId }).limit(limit);
      }

      // Format exercise objects
      const formattedExercises = exercises.map(exercise => {
        return ({
          description: exercise.description,
          duration: exercise.duration,
          date: exercise.date.toDateString()
        });
      });

      // Return the log
      res.json({
        _id: userId,
        username,
        count: exercises.length,
        log: [ ...formattedExercises ]
      });

    } catch (err) {
      console.error("Error in GET /api/users/:_id/logs:", err);
      res.json({ error: "Interal server error" });
    }
  });


// Convert date string to date obj (time zone issue if conversion is not done manually)
function convertDate(date) {
  if (date === "" || date === undefined) {
    date = new Date();
  } else {
    const dateParts = date.split('-');
    const year = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10) - 1; // Months are zero-based
    const day = parseInt(dateParts[2], 10);
    date = new Date(year, month, day);
  }
  return date;
}