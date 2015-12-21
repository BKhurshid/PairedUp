var express = require('express');
var qs = require('querystring');
var bodyParser = require('body-parser');
var favicon = require('express-favicon');
var favicon = require('serve-favicon');
var fs = require('fs');
//Need if we want to check req.file; 
var multer  = require('multer')
var cookieParser = require('cookie-parser');
// var cors = require('cors');
var request = require('request');
// var jwt = require('jwt-simple');
// var moment = require('moment');
var path = require('path');
var config = require('./config.js');
var mongoose = require('mongoose');
var app = express();
var http = require('http');
var server = http.Server(app);
var passport = require('passport');
var flash    = require('connect-flash');
var GitHubStrategy = require('passport-github').Strategy;
var GITHUB_CLIENT_ID = config.TOKEN_SECRET ;
var GITHUB_CLIENT_SECRET = config.GITHUB_SECRET;
var session = require('express-session');
var morgan = require('morgan');
var logger = require('morgan');
// var router = express.Router();

//I believe we need if we want to check req.file
var upload = multer({ dest: 'uploads/' });

//I believe we need if we want to check req.file
//The docs are not clear on the next two lines. Both lines are necessary for sockets.
var socketio = require('socket.io');
var io = socketio(server);
server.listen(8080);
console.log("App listening on port 8080");


var db = require('./database/UserModel');
var User = db.user


app.set('port', process.env.PORT || 8080);
app.use(upload.single('string'));
app.use(favicon(__dirname + "/favicon.ico"));
app.use(flash()); // use connect-flash for flash messages stored in session
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/client'));                 
//serves up static files, otherwise we would not be able to load angular (and all the other bower components) in the index.html file
app.use('/bower_components', express.static(__dirname + '/bower_components'));
// Initialize Passport!  Also use passport.session() middleware, to support
  // persistent login sessions (recommended).
app.use(passport.initialize());
app.use(passport.session());
app.use(session({ 
      name: "UserFromPearedUp",
      secret: "keyboard cat", 
      // cookie: {maxAge: 3600000},
      resave: true, 
      saveUninitialized: true, 
      cookie: { path: '/', httpOnly: false, secure: false, maxAge: null }
       }));
      

// Force HTTPS on Heroku
if (app.get('env') === 'production') {
  app.use(function(req, res, next) {
    var protocol = req.get('x-forwarded-proto');
    protocol == 'https' ? next() : res.redirect('https://' + req.hostname + req.url);
  });
}

//to allow cross origin (need to add more to this comment.)
app.all('/*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type");

  next();
});

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete GitHub profile is serialized
//   and deserialized.
passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

app.get('/', function(req, res){
  console.log("Hello");
  // res.send("hello world");
  // res.render('index.html', { user: req.user });
});

// Use the GitHubStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and GitHub
//   profile), and invoke a callback with a user object.
var globalProfile;
// GET /auth/github
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in GitHub authentication will involve redirecting
//   the user to github.com.  After authorization, GitHubwill redirect the user
//   back to this application at /auth/github/callback
//Step 1
app.get('/auth/github',
  passport.authenticate('github'),
  function(req, res){
    console.log("hello I am in authenticated");
    // The request will be redirected to GitHub for authentication, so this
    // function will not be called.
  });

// GET /auth/github/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
//Step 2
app.get('/auth/github/callback', 
  passport.authenticate('github', { failureRedirect: '/login' }),
  //This is the request handler that will be called when they click the log in to get hub. 
  function(req, res) {
    console.log("This is the request handler that will be called when they click the log in to github");
    //res.redirect('/');
    res.redirect('http://localhost:8080/#/profile');
  });


app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});


// This will be the route to call when my page gets redirected to the profile. So my profile page should do a http.get to this route automatically once the user is logged in. 
//Step 3
app.get('/account', ensureAuthenticated, function(req, res){
  // console.log('this is the req.user in the account route', req.user);
  res.json(req.user);
});
// var userSession;
app.get('/login', function(req, res){
    // console.log('this is the req.user in the login route', req);
    console.log("This is the req.session", req.session);
    // console.log("This is the req.session", req.session);
    console.log("globalProfile", globalProfile);
    //to identify each individual user. This might not be the best idea as we want to access the cookie. 
    // userSession = req.sessions 

    req.session.githubID = globalProfile.github;
    req.session.userForTheMoment = globalProfile;
    console.log("req.session after assignment of req.session.githubID", req.session);
    if(typeof req.cookies['UserFromPearedUp'] !== 'undefined') {
            console.log("This is req.cookies[userfromPearedUp]",req.cookies['UserFromPearedUp']);
        }
        console.log("This is req", req);
    res.json({profile: globalProfile, sessions: req.session});
});



app.post('/getFromDatabaseBecausePersonSignedIn', function(req, res) {
  console.log("req.body in checkIfLoggedIn", req.body);
  var currentUser;
  User.findOne({displayName: req.body.displayName}, function (err, user) {
        if (user) {
          console.log("User in database", user)
          res.json({user:user});
        }else if (err) {
          return "This is error message: " + err; 
        }

      });
    console.log("This is currentUser", currentUser);
  // res.send({response: currentUser});
});

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
//Step 4:
function ensureAuthenticated(req, res, next) {
  //req.isAuthenticated() is undefined here. Therefore it is false and not going through the if. 
  if (req.isAuthenticated()) { 
    return next(); 
  }
  
  res.redirect('/login');
}



passport.use(new GitHubStrategy({
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    callbackURL: "http://127.0.0.1:8080/auth/github/callback"
  },
  //Step 5
  function(accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      // console.log("accessToken", accessToken);
      // console.log("refreshToken",refreshToken );
      // console.log("profile", profile);
      // console.log("This is the avatar_url:::::::", profile._json.avatar_url)
      // User.findOrCreate
      // var user;
      User.findOne({github: profile.id}, function (err, user) {
        if (user) {
          // console.log('this is the user', user);
        globalProfile = user;
        }else {
          var user = new User();
          user.github = profile.id;
          user.picture = profile._json.avatar_url;
          user.displayName = profile.displayName;
          user.save(function() {
            // console.log(user + ' was saved');
          });
          globalProfile = user;
        }
      });
      //TODO: This is where I will have to do actuall login stuff. Like saving user to database;
      // To keep the example simple, the user's GitHub profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the GitHub account with a user record in your database,
      // and return that user instead.
      // globalProfile = profile;
      return done(null, profile);
    });
  }
));



// var isAuthenticated = function 
/*

 |--------------------------------------------------------------------------
 | PUT /api/me
 |--------------------------------------------------------------------------
 */

// app.put('/api/me', function(req, res) {
//   User.user.findById(req.user, function(err, user) {
//     if (!user) {
//       return res.status(400).send({ message: 'User not found' });
//     }
//     user.displayName = req.body.displayName || user.displayName;
//     user.email = req.body.email || user.email;
//     user.save(function(err) {
//       res.status(200).end();
//     });
//   });
// });


/*
 |--------------------------------------------------------------------------
 | Unlink Provider
 |--------------------------------------------------------------------------
 */
// app.post('/auth/unlink', ensureAuthenticated, function(req, res) {
//   var provider = req.body.provider;
//   var providers = ['facebook', 'foursquare', 'google', 'github', 'instagram',
//     'linkedin', 'live', 'twitter', 'twitch', 'yahoo'];

//   if (providers.indexOf(provider) === -1) {
//     return res.status(400).send({ message: 'Unknown OAuth Provider' });
//   }

//   User.user.findById(req.user, function(err, user) {
//     if (!user) {
//       return res.status(400).send({ message: 'User Not Found' });
//     }
//     user[provider] = undefined;
//     user.save(function() {
//       res.status(200).end();
//     });
//   });
// });






var usersRoom;


//The first event we will use is the connection event. It is fired when a client tries to connect to the server; Socket.io creates a new socket that we will use to receive or send messages to the client.
io.on('connection', function(socket) {
  console.log('new connection');

  //some room will be a variable. 
  // io.to(usersRoom).emit(usersRoom);
  //listen for a signal called add-customer. General code
  // socket.on('add-customer', function(textFromEditor) {
  //   console.log("Just heard a add-customer from Joseph");
  //   //send a signal to frontEnd called notification
  //   io.emit('notification', textFromEditor);

  // });
//general code
  socket.on('/create', function(data) {
    usersRoom = data.title
    //Have the socket join a rooom that is named after the title of their document
    socket.join(data.title);
    //Listen for a emit from client that's message is the title of the document
    socket.on(data.title, function(data) {
      //send a signal to frontEnd called notification
      socket.broadcast.emit('notification', data);
      });
    });
  //working on chat feature with sockets
    socket.on('new message', function(message) {
      //general algorithim for storing messages shall go here. 

      //hard coded message document to test persisting chat data
      var JosephMessages = new User.messages({
        nameOfChat: "Joseph", 
        messageContent: "This is a message"
      });
      //save josephMessages document into the database
      JosephMessages.save(function(err, results){
        if (err) {
          console.log("err", err);
        }
        else {
          console.log("Saved into MONGODB Success")
        }
        //search for messages that have Joseph as the name of their chat
        User.messages.find({ nameOfChat: 'Joseph' }, function(err, results) {
          console.log("ALL THE JOSEPH MESSAGES", results);
        });
      })

      //Sending a signal to the front end, along with the message from chat. This is so we can test the chat feature. Will build off of it later. 
      io.emit('publish message', message);
      });
});

//content will hold the data from the uploaded file
var content;
//Need to build this function to get around asynchronous behavior.
var sendFileDataToClient = function(data) {
  //send the data from the file to the client. 
  io.emit('fileData', content);
}

//Initiating the file upload. Immediately happens after someone clickes the upload file button
app.post('/fileUpload', function(req, res, next) {
  //collect the data from the file in a human readable form. 
     fs.readFile(req.file.path, 'ascii', function ( error, data ) {
      if ( error ) {
        console.error( error );
      } else {
        //content is being asynchronously set to the data in the file
        content = data;
        //To get around the synchronous behavior we wrap the next step into the function sendFileDataToClient. Which will just emit the content, but this way we are sure that content is done receiving the data from the file.
        sendFileDataToClient(content)

      }
  });
});



  


