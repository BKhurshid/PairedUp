angular.module('myApp', [
	'ui.router',
	'ui.ace',
	'ui.bootstrap',
	'myApp.codeshare',
      //for client side sockets
      'btford.socket-io',
      //for the authentication.
      'satellizer',
      // 'Icecomm'

])
.config(function($stateProvider, $urlRouterProvider, $locationProvider, $authProvider){


	$stateProvider
		.state('signup', {
			url: '/signup',
			templateUrl: 'auth/signup/signup.html'
		})
		.state('mentee', {
			url: '/mentee',
			templateUrl: 'auth/signup/menteesignup.html'
		})
		.state('mentor', {
			url: '/mentor',
			templateUrl: 'auth/signup/mentorsignup.html'
		})

		.state('login', {
			url: '/login',
			templateUrl: 'auth/login/login.html',
			controller: 'LoggedIn'
		})
		.state('map', {
			url: '/map',
			templateUrl: 'map/map.html'
		})

		// codeshare was added using the following: https://github.com/angular-ui/ui-ace
			
		// 	you can also trying implementing the ace raw 

		// 	https://ace.c9.io/

		// 	in order to view this page you must install bower like so 
		// 	bower install angular-ui-ace#bower
		// 	or 
		// 	bower install -g --save angular-ui-ace#bower

		// 	whatever works for you
		.state('codeshare', {
			url: '/codeshare',
			templateUrl: 'codeshare/codeshare.html',
			controller: 'CodeShareController'
		})

	$urlRouterProvider.otherwise('/');

	$authProvider.github({
	  url: '/auth/github',
	  authorizationEndpoint: 'https://github.com/login/oauth/authorize',
    clientId: "6ffd349ee17a258a13ff",
	  redirectUri: window.location.origin,  
	  optionalUrlParams: ['scope'],
	  scope: ['user'],
	  scopeDelimiter: ' ',
	  type: '2.0',
	  popupOptions: { width: 1020, height: 618 }
	});

	function skipIfLoggedIn($q, $auth) {
	      var deferred = $q.defer();
	      if ($auth.isAuthenticated()) {
	        deferred.reject();
	      } else {
	        deferred.resolve();
	      }
	      return deferred.promise;
	    }

	    function loginRequired($q, $location, $auth) {
	      var deferred = $q.defer();
	      if ($auth.isAuthenticated()) {
	        deferred.resolve();
          console.log('hi, i am in');
	      } else {
	        $location.path('/login');
	      }
	      return deferred.promise;
	    }

})



// .directive('iceComm', function($sce) {
//   return {
//     restrict: 'E',
//     scope: {},
//     templateUrl: "codeshare/codeshare.html",
//     link: function($scope, ele, atts) {
//       console.log("link");
//       var comm = new Icecomm( atts.apikey );
//       $scope.peers = [];
//       comm.on("local",function(peer){
//         $scope.$apply(function () {
//           peer.stream = $sce.trustAsResourceUrl(peer.stream);
//           $scope.local = peer;
//         });
//       });
//       comm.on("connected", function(peer){
//         $scope.$apply(function () {
//           peer.stream = $sce.trustAsResourceUrl(peer.stream);
//           $scope.peers.push(peer);
//         });
//       });
      
//       comm.on("disconnect", function(peer){
//         $scope.$apply(function () {
//           $scope.peers.splice($scope.peers.indexOf(peer),1);
//         });
//       });
//       $scope.connect = function(room){
//         if($scope.current_room) throw new Error("You already have a room");
//         $scope.current_room = room;
//         comm.connect(room, {audio: false});
//       };
//       $scope.close = function(){
//         comm.leave();
//       };
//       $scope.roomEvent = function(e,value){
//         if(e.which !== 13) return;
//         $scope.connect(room.value);
//         room.value = "";
//       };
//       ele.find("button.close").bind("click",$scope.close);
//       ele.on('$destroy', $scope.close);
//       if(atts.room){
//         $scope.connect(atts.room);
//       }
//     }
//   };
// })


.service('authToken', function() {
    this.name='carine'
    this.login = function(){console.log(this.name, "is logged in")}
 	
})

.controller('LoggedIn', function($scope, $auth, $location, $auth, authToken/*toastr*/, $http) {


   // $scope.login = function() {
   //    $auth.login($scope.user)
   //      .then(function() {
   //    console.log($scope.user);
   //        // toastr.success('You have successfully signed in!');
   //        $location.path('/');
   //      })
   //      .catch(function(error) {
   //        // toastr.error(error.data.message, error.status);
   //      });
   //  };
    $scope.authenticate = function() {
      $auth.authenticate('github')
        .then(function(response) {
          var test = JSON.stringify(response.data.user);
          console.log('this...', test);
          $scope.username = test;
          // toastr.success('You have successfully signed in with ' + provider + '!');
          $location.path('/');
        })
        .catch(function(error) {
          if (error.error) {
            // Popup error - invalid redirect_uri, pressed cancel button, etc.
            // toastr.error(error.error);
          } else if (error.data) {
            // HTTP response error from server
            // toastr.error(error.data.message, error.status);
          } else {
            // toastr.error(error);
          }
        });
    };
})//;

.factory('socket', ['$rootScope', function($rootScope) {
    //A socket connection to our server.
  var socket = io.connect("http://localhost:8080");
  return {
    //listen to events.
    on: function(eventName, callback){
      socket.on(eventName, callback);
    },
    //give off signals to anyone who might be listening (such as the server).
    emit: function(eventName, data) {
      socket.emit(eventName, data);
    }
  };
}])
//example chat for front end. 
.controller('ExampleController', ['$scope', '$http', 'socket', function($scope, $http, socket){
      //Where the text is held for the template chat. The template chat is not persisting data.
    $scope.list = [];
      //Listen when the server emits publish message and preform the a callback. This is to simulate going back to the server and have the info come back, as we will on the fully functional chat. 
    socket.on("publish message", function(data) {
        //set $scope.text to the text from the messages we received from the server (and database (?)).
        $scope.text = data.text;
        //Angular was not interacting inside socket well. So the function apply was needed to smooth over the bugs.
        $scope.$apply(function(){
            //store the message in the list array. Thus rendering it on the page, thanks to Angular's two way data binding.
            $scope.list.push(data.text); 
        
        });
    });
    /* This is for the message button. When I want to message someone. This button should take me to a webpage that has our previous messages.*/
    //scope.chatBox function 
    $scope.sendMessage = function (fromUser, toUser) {
      ///TODO: grab current user's name and the other user's name

      //store that name in a object
        var roomName = {
            userWhoClicked: fromUser,
            userWhoWasClicked: toUser
        };
      //socket emit chatRoom with this users name and the other users name
        socket.emit("chatBox", roomName);
    };



    
    //When someone clicks the submit button for the template chat. In other words, when someone submits a message to the chat box. 
    $scope.submit = function() {
        //if there is text in the box.
        console.log("in submit")
        // $http.get('http://localhost:8080/name').then(function(response) {
        //   console.log("The success callback from the frontEnd get request.");
        // }, function(err) {
        //   console.log("err", err);
        // });
        if ($scope.text) {
            //emit a new message with the text data. Will store this in the database. 
            socket.emit('new message', {text: $scope.text});
        }
    };
}]);
