var express = require('express');
var favicon = require('serve-favicon');
//instantiate an express object
var app = express(); 
//for the image on the top left corner of the tab, on the web browser                             
app.use(favicon(__dirname + "/favicon.ico"));
var fs = require('fs');
//Need if we want to check req.file; 
var multer  = require('multer')

var cookieParser = require('cookie-parser');
var request = require('request');
//JS:I don't know what qs is doing in this program. 
var qs = require('querystring');
//JS:I don't know what jwt is doing in this program. 
var jwt = require('jwt-simple');
//JS:I don't know what moment is doing in this program. 
var moment = require('moment');
//I believe we need if we want to check req.file
var upload = multer({ dest: 'uploads/' });
var bodyParser = require('body-parser');   
//I believe we need if we want to check req.file
app.use(upload.single('string'));
//DELETE BusBoy in package.json

var http = require('http');
var path = require('path');
//should have access to user mongoose model with this
var mongoose = require('mongoose');
// //should have access to user mongoose model and message mongoose model with this.
var db = require('./server/database/UserModel');
//I believe server is an instance of a event emitter. An object with many requesthandle properties. That is a tenative assessment. 
//Necessary for making sockets.
var server = http.Server(app);
//The docs are not clear on the next two lines.Both lines are necessary for sockets.
var socketio = require('socket.io');
var io = socketio(server);
//listening to server
server.listen(8080);
console.log("App listening on port 8080");

//serves up static files, otherwise we would not be able to load the index.html file
app.use(express.static(__dirname + '/client'));                 
//serves up static files, otherwise we would not be able to load angular (and all the other bower components) in the index.html file
app.use('/bower_components', express.static(__dirname + '/bower_components'));

//not sure what this does. Need to research. 
app.use(bodyParser.urlencoded({'extended':'true'}));            

//need this so that req.body will not be undefined and will actually hold the data that is sent from the frontEnd. 
// Needed to handle JSON posts

app.use(bodyParser.json());   

// Once the server is running, it will be available for socket clients to connect. A client trying to establish a connection with the Socket.io server will start by initiating the handshaking process.

// var passport = require('passport');
// var githubsecret = require('passport-github').Strategy;
// var secret = require('githubsecret');
// // var findOneOrCreate = require('mongoose-find-one-or-create');








//JS: I do not know what this does
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







// /*Login Github Oauth Angular stuff too*/
app.post('/auth/github', function(req, res) {
  // console.log('this.....', res);
  console.log("In the postAuth GIthub")
  var accessTokenUrl = 'https://github.com/login/oauth/access_token';
  var userApiUrl = 'https://api.github.com/user';
  var params = {
    code: req.body.code,
    client_id: req.body.clientId,
    client_secret: "ec5ccdd036aede19767499594e72fc90e7cf734e",
    redirect_uri: req.body.redirectUri,
    // grant_type: 'authorization_code'
  };

//   // Step 1. Exchange authorization code for access token.
  request.get({ url: accessTokenUrl, qs: params}, function(err, response, accessToken) {
    accessToken = qs.parse(accessToken);
    // console.log('response-------', response);
    // console.log('heyyyyyy-----', accessToken);
    var headers = { 'User-Agent': 'Satellizer' };

//     // Step 2. Retrieve profile information about the current user.
    request.get({ url: userApiUrl, qs: accessToken, headers: headers, json: true }, function(err, response, profile) {
        // console.log('this is the profile------', profile);
//       // Step 3a. Link user accounts.
      if (req.headers.authorization) {

      //   db.findOne({ github: profile.id }, function(err, existingUser) {
      //     console.log('in post to db ---------------', existingUser);
      //     if (existingUser) {
      //       return res.status(409).send({ message: 'There is already a GitHub account that belongs to you' });
      //     }
      //     var token = req.headers.authorization.split(' ')[1];
      //     var payload = jwt.decode(token, 'shhhh');
      //     db.findById(payload.sub, function(err, user) {
      //       if (!user) {

      //         console.log('user ----------', user);
      //         return res.status(400).send({ message: 'User not found' });
      //       }
      //       // var user = new db();
      //       user.github = profile.id;
      //       user.picture = user.picture || profile.avatar_url;
      //       user.displayName = user.displayName || profile.name;
      //       // user.name = profile.name;
      //       user.save(function() {
      //         var token = createJWT(user);
      //         res.send({ token: token });
      //       });
      //     });
      //   });
      //   //   console.log('auth head---------');
      // }else{
         // Step 3b. Create a new user account or return an existing one.
          db.findOne({ github: profile.id }, function(err, existingUser) {
            console.log('existingUser------', existingUser);
            if (existingUser) {
              var token = createJWT(existingUser);
              return res.send({ token: token, user: existingUser});
            }
            var user = new db();
            user.github = profile.id;
            user.picture = profile.avatar_url;
            user.displayName = profile.name;
            // user.name = profile.name;
            user.save(function() {
              var token = createJWT(user);
              res.send({ token: token, user: user});
            });
          });
        }

    });
  });
});

//for every path request. 
app.get('*', function(req, res, next) {
  // load the single view file (angular will handle the page changes on the front-end)
        res.sendFile(__dirname + '/client/index.html'); 
        next();
    });
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
      var JosephMessages = new db.messages({
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

        /*This code is written as if we have the user and we have a button that asks to send message to PERSONNAME*/
          


          //Check database (through meshing the two names back to back. check both versions- e.g. joshjane and janejosh) to see if a previous room between these two users ever occured. 
            // if it exists
              //pull out the messages that are in the database and send them to the front end. 
            //else if the chat does not exist does not exist 
              //create one and store it in the database

          //create socket room and have these two users join it. 

          //create socket listener for when they click submit message. 
            //save the message in the database to the user document that we found or have created. 
            //have some way to differentiate the messages within the document (how to tell who is from what user and how to tell when the messages are different from each other: Possible way to do this is to Put the name of the messenger at the front of every message (?).

            //emit a signal with the current message as the data. 

            



         /*This ends the code written as if we have the user*/






        //search for messages that have Joseph as the name of their chat
        // db.messages.find({ nameOfChat: 'Joseph' }, function(err, results) {
          // console.log("ALL THE JOSEPH MESSAGES", results);
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