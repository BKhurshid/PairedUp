var mongoose = require('mongoose');
var config = require('../config.js');
var Schema = mongoose.Schema;

//Line 5 or line 10. Not both. 
/*mongodb:// username:password@ hostname:port/ database
*/

// Since you're connecting to a local instance, you can skip the username and password and use the following URI:


var uri = config.MONGO_URI; 
var db = require('mongoose').connect(uri);

var userSchema = new Schema({
 displayName: String,
 // name: String,
 picture: String,
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
// userSchema.methods.speak = function () {
//  var greeting = this.username? "Meow name is " + this.username: "I don't have a name";
//  console.log(greeting);
// }


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
    messages: Message
};