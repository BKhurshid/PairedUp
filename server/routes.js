var passport = require('passport');

var User = require('./userProfile/UserModel').user;
var Skills = require('./database/SkillsModel').skills;

var utils = require('./utils.js');
var userAuthUtil = require('./userProfile/userOAuthUtils');
var userUtils = require('./userProfile/userUtils');
var documentUtils = require('./documents/documentUtils');

var GitHubStrategy = require('passport-github').Strategy;
var config = require('../config.js');

module.exports = function(app) {

  if (app.get('env') === 'production') {
    app.use(utils.forceHTTPS);
  }

  app.all('/*', utils.allowCrossOrigin);

  app.get('/', function(req, res){});

  app.get('/auth/github',
    passport.authenticate('github'),
    function(req, res){
    });

  app.get('/auth/github/callback', 
    passport.authenticate('github', { failureRedirect: '/login' }),
    userAuthUtil.directToProfile);

  app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
  });

  app.get('/account', userAuthUtil.ensureAuthenticated, function(req, res){
    res.json(req.user);
  });

  app.get('/login', userAuthUtil.sendingUserToClient);

  passport.use(new GitHubStrategy({
      clientID: config.GITHUB_CLIENT_ID,
      clientSecret: config.GITHUB_SECRET,
      callbackURL: "http://127.0.0.1:8080/auth/github/callback"
    }, userAuthUtil.setingUserToGlobalProfile));


  app.post('/founduser', function(req, res){
    User.findOne({displayName: req.body.user}, function(err, user){
      if(err){return console.log('no founduser', err)}
      res.json(user);
    });
  });

  app.post('/chats', function(req, res){
    roomname = data.fromUser+data.toUser.displayName
    Messages.find({room: data.toUser.displayName+data.fromUser.displayName}, function(err, msg){
      if(err){return err}
      if(msg[0] === undefined){
        roomname = data.fromUser.displayName+data.toUser.displayName
      } else if(msg[0].room){
        roomname = data.toUser.displayName+data.fromUser.displayName
      }
      res.json(msg);
    });
  });

  app.post('/skills', function(req, res, next) {
    User.findOne({github: req.body.github}, function(err, user) {
      if(err){return next(err)}
        for(var key in req.body){
          if (req.body[key] !== req.body.github)
          user.skills[key] = req.body[key]
        }
      user.save(function(err, user){
        if (err){return next(err)}
      });
    });
  });

  app.post('/futureskills', function(req, res, next){
    User.findOne({github: req.body.github}, function(err, user) {
      if(err){
        return next(err);
      }
        for(var key in req.body){
          if (req.body[key] !== req.body.github) {
          user.futureskills[key] = req.body[key];
        }
      user.save(function(err, user){
        if (err){
          return next(err);
        }
    
    });
  };
  });
  });

  app.get('/oneuserskill', function(req, res, next){
    User.find(function(err, user){
      if(err){next(err);}
      res.json(user);
    });
  });

  

  app.post('/getFromDatabaseBecausePersonSignedIn', userUtils.getFromDatabaseBecausePersonSignedIn);

  function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { 
      console.log('this is ensureAuthenticated', isAuthenticated);
      return next(); }
    res.redirect('/login');
  }

  app.post('/savingDocumentsToDatabase', documentUtils.savingDocumentsToDatabase);

  app.post('/retrievingDocumentsForUser', documentUtils.retrievingDocumentsForUser);

  app.post('/deleteDocumentsForUser', documentUtils.deleteDocumentsForUser);

  app.post('/api/upload', function(req,res) {
    res.json({});
  });
  
};
