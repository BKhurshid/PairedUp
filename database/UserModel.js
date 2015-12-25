var mongoose = require('mongoose');
var config = require('../config.js');
var Schema = mongoose.Schema;

//Line 5 or line 10. Not both. 
/*mongodb:// username:password@ hostname:port/ database
*/

// Since you're connecting to a local instance, you can skip the username and password and use the following URI:


var uri = config.MONGO_URI; 
mongoose.connect(uri);

var db = mongoose.connection;
db.on('error', function(err){
  console.log('connection error', err);

});

db.once('open', function(){
  console.log('connect');
});

var userSchema = new Schema({
 displayName: String,
 // name: String,
 picture: String,
 loggedIn: Boolean, 
 wantsToConnect: Boolean, 
 connected: Boolean, 
 github: String
 // lastname: String,
 // password: String, 
 // officeHours: String,
 // angular: String, 
 // node: String, 
 // javascript: String, 
 // skill: String,
 // interest: String

});

var messageSchema = new Schema({
    nameOfChat: String, 
    messageContent: String
});
var documentSchema = new Schema ({
    id: Number, 
    title: String, 
    mode: String,
    displayName: String, 
    code: String
});
// userSchema.methods.speak = function () {
//  var greeting = this.username? "Meow name is " + this.username: "I don't have a name";
//  console.log(greeting);
// }

var Document = mongoose.model('Document', documentSchema);
var Message = mongoose.model('Messages', messageSchema);
var User = mongoose.model("User", userSchema);

// var Joseph = new User({
//  username: "JosephSun",
//  firstname: "Bazz",
//  lastname: "Khurshid",
//  password: "YouKnowz", 
//  officeHours: "9-10",
//  angular: "65", 
//  node: "70", 
//  javascript: "80", 
//  interest: "Databases, Augmented reality, Big Data"
// });

// console.log("Joseph is speaking",Joseph.speak());
// Joseph.save(function (err, Joseph) {
//   if (err) return console.error(err);
//   console.log("This is joseph", Joseph);
//   Joseph.speak();
// });
/*Ultimate Product

*/
module.exports = {
    user: User,
    messages: Message,
    userDocument: Document
};