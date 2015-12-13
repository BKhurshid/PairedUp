var express = require('express');
var qs = require('querystring');
var bodyParser = require('body-parser');
var favicon = require('express-favicon');
var favicon = require('serve-favicon');
var fs = require('fs');
//Need if we want to check req.file; 
var multer  = require('multer')
var cookieParser = require('cookie-parser');
var logger = require('morgan');
// var cors = require('cors');
var request = require('request');
var jwt = require('jwt-simple');
var moment = require('moment');
var path = require('path');
var config = require('./config.js');
var mongoose = require('mongoose');
var app = express();

//I believe we need if we want to check req.file
var upload = multer({ dest: 'uploads/' });

//I believe we need if we want to check req.file
app.use(upload.single('string'));
//DELETE BusBoy in package.json
//for the image on the top left corner of the tab, on the web browser                             
app.use(favicon(__dirname + "/favicon.ico"));

var http = require('http');

// //should have access to user mongoose model and message mongoose model with this.
// var User = require('./database/UserModel');
//I believe server is an instance of a event emitter. An object with many requesthandle properties. That is a tenative assessment. 
//Necessary for making sockets.
var server = http.Server(app);
//The docs are not clear on the next two lines.Both lines are necessary for sockets.
var socketio = require('socket.io');
var io = socketio(server);
//listening to server
server.listen(8080);
console.log("App listening on port 8080");


var User = require('./database/UserModel');


app.set('port', process.env.PORT || 8080);
// app.use(cors());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Force HTTPS on Heroku
if (app.get('env') === 'production') {
  app.use(function(req, res, next) {
    var protocol = req.get('x-forwarded-proto');
    protocol == 'https' ? next() : res.redirect('https://' + req.hostname + req.url);
  });
}

app.use(express.static(__dirname + '/client'));                 
//serves up static files, otherwise we would not be able to load angular (and all the other bower components) in the index.html file
app.use('/bower_components', express.static(__dirname + '/bower_components'));


//for every path request. 
// app.get('*', function(req, res) {
//   // load the single view file (angular will handle the page changes on the front-end)
//         res.sendFile(__dirname + '/client/index.html'); 
//     });

// app.use(bodyParser.urlencoded({'extended':'true'}));            

//need this so that req.body will not be undefined and will actually hold the data that is sent from the frontEnd. 
// app.use(bodyParser.json());                                  

            

//need this so that req.body will not be undefined and will actually hold the data that is sent from the frontEnd. 
// <<<<<<< HEAD
// Needed to handle JSON posts

// app.use(bodyParser.json());   

// Once the server is running, it will be available for socket clients to connect. A client trying to establish a connection with the Socket.io server will start by initiating the handshaking process.

// =======

// Once the server is running, it will be available for socket clients to connect. A client trying to establish a connection with the Socket.io server will start by initiating the handshaking process.

/*
 |--------------------------------------------------------------------------
 | Login Required Middleware
 |--------------------------------------------------------------------------
 */

 //makes sure that user is authenticated
    //********************COMMENTING THIS OUT BECAUSE I AM TRYING PASSPORT
// function ensureAuthenticated(req, res, next) {
//   if (!req.headers.authorization) {
//     return res.status(401).send({ message: 'Please make sure your request has an Authorization header' });
//   }
//   var token = req.headers.authorization.split(' ')[1];

//   var payload = null;
//   try {
//     payload = jwt.decode(token, config.TOKEN_SECRET);
//   }
//   catch (err) {
//     return res.status(401).send({ message: err.message });
//   }

//   if (payload.exp <= moment().unix()) {
//     return res.status(401).send({ message: 'Token has expired' });
//   }
//   req.user = payload.sub;
//   next();
// }


/*
 |--------------------------------------------------------------------------
 | Sockets Connection
 |--------------------------------------------------------------------------
 */


// >>>>>>> d2ca01f956b54be701230846e82c61adfda832e7








/*
 |--------------------------------------------------------------------------
 | Generate JSON Web Token
 |--------------------------------------------------------------------------
 */



function createJWT(user){
  var payload = {
    sub: user._id,
    iat: moment().unix(),
    exp: moment().add(14, 'days').unix()
  };
  return jwt.encode(payload, 'shhhh');
}


/*
A request handler is a function that will be executed every time the server receives a particular request, usually defined by an HTTP method (e.g., GET) and the URL path (i.e., the URL without the protocol, host, and port). The Express.js request handler needs at least two parameters—request, or simply req, and response, or res.
*/

//to allow cross origin (need to add more to this comment.)
app.all('/*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type");
  next();
});



/*
 |--------------------------------------------------------------------------
 | GET /api/me
 |--------------------------------------------------------------------------
 */

app.get('/api/me', function(req, res) {
  var test = Object.keys(req);
  console.log('req', req.params);
  User.user.findById(req.user, function(err, user) {
    console.log('this is the user crap', user)
    console.log('this, is the err', err);
    res.send(user);
  });
});

/*
 |--------------------------------------------------------------------------
 | PUT /api/me
 |--------------------------------------------------------------------------
 */

app.put('/api/me', function(req, res) {
  User.user.findById(req.user, function(err, user) {
    if (!user) {
      return res.status(400).send({ message: 'User not found' });
    }
    user.displayName = req.body.displayName || user.displayName;
    user.email = req.body.email || user.email;
    user.save(function(err) {
      res.status(200).end();
    });
  });
});

/*
 |--------------------------------------------------------------------------
 | Login with GitHub
 |--------------------------------------------------------------------------
 */






app.post('/auth/github', function(req, res) {
  console.log('heeyyy work it', res)
  var accessTokenUrl = 'https://github.com/login/oauth/access_token';
  var userApiUrl = 'https://api.github.com/user';
  var params = {
    code: req.body.code,
    client_id: req.body.clientId,
    client_secret: config.GITHUB_SECRET,
    redirect_uri: req.body.redirectUri
  };

  // Step 1. Exchange authorization code for access token.
  request.get({ url: accessTokenUrl, qs: params }, function(err, response, accessToken) {
    accessToken = qs.parse(accessToken);
    var headers = { 'User-Agent': 'Satellizer' };

    // Step 2. Retrieve profile information about the current user.
    request.get({ url: userApiUrl, qs: accessToken, headers: headers, json: true }, function(err, response, profile) {
      console.log('this is a profile', profile);
      // Step 3a. Link user accounts.
      if (req.headers.authorization) {
        console.log('inside authorization if statement ---------------');
        // User.user.findOne({ github: profile.id }, function(err, existingUser) {
        //   console.log('this is the user in the database', existingUser);
        //   if (existingUser) {
        //     return res.status(409).send({ message: 'There is already a GitHub account that belongs to you' });
        //   }
        //   var token = req.headers.authorization.split(' ')[1];
        //   // console.log('this is the token', token)
        //   var payload = jwt.decode(token, config.TOKEN_SECRET);
        //   User.user.findById(payload.sub, function(err, user) {
        //     if (!user) {
        //       return res.status(400).send({ message: 'User not found' });
        //     }
        //     user.github = profile.id;
        //     user.picture = user.picture || profile.avatar_url;
        //     user.displayName = user.displayName || profile.name;
        //     user.save(function() {
        //       var token = createJWT(user);
        //       res.send({ token: token });
        //     });
        //   });
        // });
      }
      // } else {
        // Step 3b. Create a new user account or return an existing one.
        User.user.findOne({ github: profile.id }, function(err, existingUser) {
          if (existingUser) {
            console.log('i am the existing user', existingUser)
            var token = createJWT(existingUser);
            return res.send({ token: token, user: existingUser });
          }
          var user = new User();
          user.github = profile.id;
          user.picture = profile.avatar_url;
          user.displayName = profile.name;
          user.save(function() {
            var token = createJWT(user);
            res.send({ token: token, user: user });
          });
        });
      
    });
  });
});

// <<<<<<< HEAD
//for every path request. 
app.get('*', function(req, res, next) {
  // load the single view file (angular will handle the page changes on the front-end)
        res.sendFile(__dirname + '/client/index.html'); 
        next();
// =======
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
// >>>>>>> d2ca01f956b54be701230846e82c61adfda832e7
    });
  // });
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

  //signal will be chat room. 
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
          console.log("Saved into MONGODB Success");
        }
// <<<<<<< HEAD



//         /*This code is written as if we have the user and we have a button that asks to send message to PERSONNAME

//         UNCOMMENT WHEN WE HAVE STABLE USERS (WHEN OAUTH WORKS)
//         */
        
//         //Not sure which name will be first given that it is random

//         var nameOfDocumentCheck1 = message.userWhoClicked  + message.userWhoWasClicked; 
//         var nameOfDocumentCheck2 = message.userWhoWasClicked + message.userWhoClicked;


//           //Check database (through meshing the two names back to back. check both versions- e.g. joshjane and janejosh) to see if a previous room between these two users ever occured. 
//           var documentOfMessages = db.messages.find({ nameOfChat: nameOfDocumentCheck2}, function(err, results) {
//                   return results; 
//         }) ||  db.messages.find({ nameOfChat: nameOfDocumentCheck1}, function(err, results) {
//                   return results; 
// =======
        //search for messages that have Joseph as the name of their chat
        User.messages.find({ nameOfChat: 'Joseph' }, function(err, results) {
          console.log("ALL THE JOSEPH MESSAGES", results);
// >>>>>>> d2ca01f956b54be701230846e82c61adfda832e7
        });
            // if it exists
            if (documentOfMessages) {
                //Send the messages, collected from the database, to the frontEnd.
                res.json(documentOfMessages.messageContent);
            
            //else if the chat does not exist does not exist 
            }else {
                //create a new message document. 
                var newChatBetweenTwoPeople = new db.messages({
                nameOfChat: nameOfDocumentCheck1, 
                messageContent: "This is a message"
                });
                //Save that new message document to the database. 
                newChatBetweenTwoPeople.save(function(err, results) {
                    if (err) {
                        console.log("ERROR", err );

                    //If the document was successfully saved to the database
                    }else {
                        //send the message to the frontEnd. 
                        res.json(documentOfMessages.messageContent);
                        


                        //create socket room, based on a combination of their names, and have these two users join it.
                        socket.join(documentOfMessages.nameOfChat || newChatBetweenTwoPeople.nameOfChat );
                        //Listen for a emit from client that's message is the title of the document
                        // socket.on(documentOfMessages.nameOfChat || newChatBetweenTwoPeople.nameOfChat , function(data) {
                        //   //send a signal to frontEnd called notification
                        //   socket.broadcast.emit('notification', data);
                        //   });


                        //create one and store it in the database


                        //create socket listener for when they click submit message. 
                          //save the message in the database to the user document that we found or have created. 
                          //have some way to differentiate the messages within the document (how to tell who is from what user and how to tell when the messages are different from each other: Possible way to do this is to Put the name of the messenger at the front of every message (?).

                          //emit a signal with the current message as the data.  
                    }
                });
            }

              //create one and store it in the database


          //create socket listener for when they click submit message. 
            //save the message in the database to the user document that we found or have created. 
            //have some way to differentiate the messages within the document (how to tell who is from what user and how to tell when the messages are different from each other: Possible way to do this is to Put the name of the messenger at the front of every message (?).

            //emit a signal with the current message as the data. 

            



         /*********************This ends the code written for the GENERAL CHAT as if we have the user**************/






        //search for messages that have Joseph as the name of their chat
        
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




/*Every piece of code beneath this line is an attempt at storing users information through cookies and accessing their information from cookies*/

// var session = require('cookie-session');
// var window = this; 
// ///////////////////////////////////////////////////////////////////////////////////////// MIDDLEWARE

// // Cookie parsing needed for sessions
// app.use(cookieParser('notsosecretkey'));

// // Session framework
// app.use(session({secret: 'notsosecretkey123'}));

// // Consider all URLs under /public/ as static files, and return them raw.
// // app.use(express.static(__dirname + '/public'));

// /////////////////////////////////////////////////////////////////////////////////////////// HANDLERS

// var getName = function (req, res) {
//   if (req.session.name) {
//     return res.json({ name: req.session.name });
//   }
//   else {
//     return res.json({ name: '' });
//   }

// };

// var setName = function (req, res) {
//   console.log('In server setName')
//   // if(!req.body.hasOwnProperty('name')) {
//   //   console.log("hello");
//   //   res.statusCode = 400;
//   //   return res.json({ error: 'Invalid message' });
//   // }
//   // else {
//     //for testing purposes
//     req.session.name = window.nameForTestingChat;
//     console.log("req.session.name", req.session.name);
//     return res.json({ name: window.nameForTestingChat });
 
//  /* Going to attempt something like this. 
//     req.session.name = req.body.name;
//     return res.json({ name: req.body.name });
//     */
//   // }
// };

// var logout = function(req, res) {
//   req.session = null;
//   return res.json({});
// };

// ///////////////////////////////////////////////////////////////////////////////////////////// ROUTES
// // app.get('/', function(){});
// app.get('/name', setName);
// app.post('/name', setName);
// app.get('/logout', logout);



// ////////////////////////////////////////////////////////////////////////////////////// SERVER LISTEN
// // var port = process.env.PORT || 3000;
// // app.listen(port, function () { console.log("Listening on port " + port); });








/*Passport */



/*From Scotch Example*/
// var express  = require('express');
// var app      = express();
var passport = require('passport');
var flash    = require('connect-flash');

// var cookieParser = require('cookie-parser');

app.use(flash()); // use connect-flash for flash messages stored in session

/*Done WIth Scotch Example*/

// var util = require('util')
var GitHubStrategy = require('passport-github').Strategy;
var GITHUB_CLIENT_ID = "clie"
var GITHUB_CLIENT_SECRET = "sec";

// var bodyParser = require('body-parser');
var session = require('express-session');
var morgan = require('morgan');
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)

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


// Use the GitHubStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and GitHub
//   profile), and invoke a callback with a user object.
passport.use(new GitHubStrategy({
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    callbackURL: "http://127.0.0.1:3000/auth/github/callback"
  },
  //Step 5
  function(accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      console.log("accessToken", accessToken);
      console.log("refreshToken",refreshToken );
      console.log("profile", profile);


      //TODO: This is where I will have to do actuall login stuff. Like saving user to database;


      // To keep the example simple, the user's GitHub profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the GitHub account with a user record in your database,
      // and return that user instead.
      return done(null, profile);
    });
  }
));


  // Initialize Passport!  Also use passport.session() middleware, to support
  // persistent login sessions (recommended).
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(express.static(__dirname + '/public'));

// app.use(bodyParser.json());
app.use(session({ secret: "keyboard cat", resave: true, saveUninitialized: true }));

app.get('/', function(req, res){
  console.log("Hello");
  // res.send("hello world");
  // res.render('index.html', { user: req.user });
});

// This will be the route to call when my page gets redirected to the profile. So my profile page should do a http.get to this route automatically once the user is logged in. 


//Step 3
app.get('/account', ensureAuthenticated, function(req, res){
  res.render('account', { user: req.user });
});

app.get('/login', function(req, res){
  res.render('login', { user: req.user });
});

// GET /auth/github
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in GitHub authentication will involve redirecting
//   the user to github.com.  After authorization, GitHubwill redirect the user
//   back to this application at /auth/github/callback

//Step 1
app.get('/auth/github',
  passport.authenticate('github'),
  function(req, res){
    console.log("hello I am in authenticat")
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
    res.redirect('https://paired-up.herokuapp.com/#/profile');

  });

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

// app.listen(8080);
// app.listen(3000);


// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.

//Step 4:
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}
/*END PASSPORT*/