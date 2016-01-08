var express = require('express');
var qs = require('querystring');
var bodyParser = require('body-parser');
// var favicon = require('express-favicon');
// var favicon = require('serve-favicon');
var fs = require('fs');
var multer  = require('multer');
var cookieParser = require('cookie-parser');
var path = require('path');
var config = require('../config.js');
var mongoose = require('mongoose');
var uri = config.MONGO_URI; 

mongoose.connect(uri);
var db = mongoose.connection;
db.on('error', function(err){
  console.log('connection error', err);
});
db.once('open', function(){
  console.log('connect');
});

var app = express();
var http = require('http');
var server = http.Server(app);
var passport = require('passport');
var flash    = require('connect-flash');
var session = require('express-session');
var morgan = require('morgan');
var upload = multer({ dest: 'uploads/' });
var socketio = require('socket.io');
var io = require('./socket/socket')(server);

server.listen(8080); 
console.log("App listening on port 8080");


var routesActivation = require('./routes');

app.set('port', process.env.PORT || 8080);
app.use(upload.single('string'));
// app.use(favicon("../favicon.ico"));
app.use(flash());
app.use(morgan('dev'));
app.use(cookieParser()); 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('../client'));
app.use(passport.initialize());
app.use(passport.session());
app.use(session({ 
  name: "UserFromPearedUp",
  secret: "keyboard cat", 
  resave: true, 
  saveUninitialized: true, 
  cookie: { path: '/', httpOnly: false, secure: false, maxAge: null }
   }));

var content;
var sendFileDataToClient = function() {
  io.emit('fileData', content);
};

app.post('/fileUpload', function(req, res, next) {

    fs.readFile(req.file.path, 'ascii', function ( error, data ) {
      if ( error ) {
        console.error( error );
      } else {
        content = data;
        sendFileDataToClient(content);
        res.json({status: "file is uploaded"});
      }
    });
  });

routesActivation(app);

