//Import
const express = require('express');
const bodyparser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const cors = require('cors');
const mongoConn = require('./mongoConfig'); // MongoDB connection string

const app = express();

app.use(cors());
// Promise
mongoose.Promise = global.Promise;
mongoose.set('useCreateIndex', true);
// Connect to database
mongoose.connect(
  mongoConn.connectString,
  { useNewUrlParser: true, useUnifiedTopology: true }
).then(() => console.log('connected to DB')).catch(error => console.error(error));
let db = mongoose.connection;

// Control db errors
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("connection established to database");
});

// Use sessions
app.use(
  session({
    secret: "someguy",
    name:'connect.sss',
    resave: false,
    saveUninitialized: true,
    cookie:{secure:false},
    store: new MongoStore({
      mongooseConnection: db
    })
  })
);
// Allow Cross-origin resourse

app.use(cors({
  origin: 'https://localhost:4200',
  methods: ['GET','POST','DELETE','PUT'],
  credentials: true
}));
// app.use((req, res, next) => {
//   res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
//   res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE");
//   res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
//   next();
// });
// Read in MongoDB schemas
var User = require('./models/user.js');
var Items = require('./models/items.js');
var LogItem = require('./models/logs.js');
mongoose.set('useFindAndModify', false);

//Bodyparser
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: false }));

// Create Users
app.post('/ft/api/create', (req, res) => {
  console.log(req.body);
  var userData = {
    email: req.body.email,
    password: req.body.password
  };
  User.create(userData, (err, user) => {
    if (err) {
      res.send(err);
      // console.log(err);
    } else {
      res.json({ status: true, user });
    }
  });
});
// login user
app.post('/ft/api/login', (req, res, next) => {
  console.log(req.body.mail);
  User.authenticate(req.body.mail, req.body.pass, (error, user) => {
    if (error || !user) {
      console.log("error");
      var err = new Error("Wrong email or password.");
      err.status = 401;
      res.json({ status: false });
    } else {
      req.session.userID = user._id;
      req.session.userName = user.email;
      console.log("no error: ", req.session);
      res.json({ status: true, userName: req.session.userName, userid: req.session.userID, session: req.session });
    }
  });
});
//check if user is logged in
app.get('/ft/api/logged', (req, res, next) => {
  console.log("UserID: " + req.session.userID);
  User.findById(req.session.userID).exec(function (err, user) {
    if (err) {
      res.json({ status: "error" });
      console.log("Error");
    } else {
      if (user === null) {
        res.json({ status: false, userid: req.session });
        console.log("No user logged in");
      } else {
        res.json({ status: true, userName: req.session.userName });
        console.log("User found " + req.session.userName);
      }
    }
  })
});
//log out user
app.get("/ft/api/logout", (req, res, next) => {
  console.log("Session destroying");
  if (req.session) {
    // Delete session
    req.session.destroy(function (err) {
      if (err) {

        res.json({ message: "error" });
        return next(err);
      } else {
        return res.json({ status: true });
      }
    });
  }
});
// User adds item
app.post('/ft/addItem', (req, res, next) => {
      console.log("success");
      console.log(req.body.ean);
      var item = new Items();
      item.name = req.body.name;
      item.brand = req.body.brand;
      item.weight = req.body.weight;
      item.ean = req.body.ean;
      item.energy = req.body.energy;
      item.carbs = req.body.carbs;
      item.sodium = req.body.sodium;
      item.fat = req.body.fat;
      item.satfat = req.body.satfat;
      item.protein = req.body.protein;
      item.sugar = req.body.sugar;
      item.contains = req.body.contains;
      item.organic = req.body.organic;
      item.fairtrade = req.body.fairtrade;
      item.eco = req.body.eco;
      item.vegetarian = req.body.vegetarian;
      item.vegan = req.body.vegan;
      item.healthnotes = req.body.healthnotes;
      
        item.save(err => {
          if (err) { res.send(err); }
          else {
            res.json({
              message: "item " + item.name + " has been added",status:true
            });
          }
        }); 
});

app.get('/ft/getItems', (req,res,next) =>{
  console.log("Getting items");
  Items.find({}).exec((err, Items)=>{
    if(err){
      res.send(err);
    }
    res.json(Items);
  })
});

app.get('/ft/getItem/:ean',(req, res, next) => {
  Items.findOne({ean: req.params.ean}).exec((error, item) =>{
    if (error){
      res.send(error);
    }
    res.json(item);
  })
});
// log item
app.post('/ft/log', (req, res, next) => {
  User.findById(req.session.userID).exec((error, user) => {
    if (error) {
      return next(error);
    }
    else {
      console.log("success");
      var log = new LogItem();

      log.user = req.session.userName;
      log.items = req.body.items;
      log.date = req.body.date;
      console.log(req.session.userName + " " + req.body.date);
      log.save(err => {
        if (err) { res.send(err); }
        else {
          res.json({
            message: "log for user: " + log.user + " has been added"
          });
        }
      });
    }

  });
});

//update log
app.put('/ft/log/:year/:month/:day', (req, res, next) => {
  User.findById(req.session.userID).exec((error, user) => {
    if (error) return next(error);
    else {
      let useDate = new Date(req.params.year + "-" + req.params.month + "-" + req.params.day);
      console.log(useDate.toDateString());
      console.log(typeof req.body.tags);
      LogItem.findOneAndUpdate(
        { date: useDate, user: req.session.userName },
        {
          energy: req.body.energy,
          carbs: req.body.carbs,
          sodium: req.body.sodium,
          fat: req.body.fat,
          satfat: req.body.satfat,
          salt: req.body.salt,
          sugar: req.body.sugar,

        }, { new: true },
        function (err, log) {
          if (err) {
            res.send(err);
            console.log("Error updating! \n" + err);

            return;
          };
          res.json({ message: " log updated for date: " + log });
        }
      );
    }
  });
});

app.get('/ft/log/:year/:month/:day', (req, res, next) => {
  //let user = req.params.user;
  let useDate = new Date(req.params.year + "-" + req.params.month + "-" + req.params.day);
  console.log(useDate);
  LogItem.find({ date: useDate, user: req.session.userName }).exec((err, logs) => {
    if (err) {
      res.send(err);
      console.log("error: " + err);
    }
    res.json(logs);
  });

});
app.get('/ft/log/all', (req, res, next) => {
  console.log("Username: " + req.session.userName);
  LogItem.find({ user: req.session.userName }).exec((err, logs) => {
    if (err) {
      res.send(err);
      console.log("error: " + err);
    }
    if (logs.length) res.json(logs);
    else res.json({ "message": "No logs found", session: req.session });
  });
});
app.set('port', 8080);
app.listen(app.get('port'), () => {
  console.log("server started on port " + app.get('port'))
});