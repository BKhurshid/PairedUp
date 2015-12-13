angular.module('myApp', [
	'ui.router',
  // 'ngRoute',
	'ui.ace',
	'ui.bootstrap',
	'myApp.codeshare',
   //for client side sockets
  'btford.socket-io',
    //for the authentication.
   'satellizer'
   // 'Icecomm'
])
.config(function($stateProvider, $urlRouterProvider, $locationProvider, $authProvider){

	$stateProvider
	
		.state('login', {
			url: '/login',
			templateUrl: 'auth/login/login.html',
			controller: 'LoginController',
      resolve: {
        skipIfLoggedIn: skipIfLoggedIn
      }
		})
    .state('logout', {
      url: '/logout',
      template: null,
      controller: 'LogoutController'
    })
		.state('map', {
			url: '/map',
			templateUrl: 'map/map.html'
		})

    .state('profile', {
      url: '/profile',
      templateUrl: 'userprofile/userprofile.html',
      controller: 'ProfileController',
      resolve: {
        loginRequired: loginRequired
      }
    })

		.state('codeshare', {
			url: '/codeshare',
			templateUrl: 'codeshare/codeshare.html',
			controller: 'CodeShareController'
		})

	$urlRouterProvider.otherwise('/');

	$authProvider.github({
    clientId: "6ffd349ee17a258a13ff",
    url: '/auth/github',
    authorizationEndpoint: 'https://github.com/login/oauth/authorize',
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

.controller('LoginController', function($scope, $auth, $location) {


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
    $scope.authenticate = function(provider) {
      $auth.authenticate(provider)
      .then(function() {

          console.log('You have successfully signed in with ' + provider + '!');
          $location.path('/profile')
        })
        .catch(function(error) {
          if (error.error) {
            // Popup error - invalid redirect_uri, pressed cancel button, etc.
            console.log(error);
            // toastr.error(error.error);
          } else if (error.data) {
            // HTTP response error from server
            // toastr.error(error.data.message, error.status);
            console.log('hiii')
          } else {
            // toastr.error(error);
            console.log('heyyyy');
          }
        });
    };
})

/*

  Nav Bar Controller

*/

.controller('NavbarController', function($scope, $auth) {
  $scope.isAuthenticated = function() {
    return $auth.isAuthenticated();
  };
})

.controller('LogoutController', function($location, $auth) {
    if (!$auth.isAuthenticated()) { return; }
    $auth.logout()
      .then(function() {
        // toastr.info('You have been logged out');
        $location.path('/');
      });
  })


.factory('Account', function($http) {
    return {
      getProfile: function() {
        console.log('inside the factory-------------');
        return $http.get('/api/me');
      },
      updateProfile: function(profileData) {
        return $http.put('/api/me', profileData);
      }
    };
})

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

