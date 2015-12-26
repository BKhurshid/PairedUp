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
			controller: 'LoginController'
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
      controller: 'ProfileController'
    })

		.state('codeshare', {
			url: '/codeshare',
			templateUrl: 'codeshare/codeshare.html',
			controller: 'CodeShareController'
		})

    .state('chat', {
      url: '/chat',
      templateUrl: 'chat/chat.html',
      controller: 'ExampleController'
    })

	$urlRouterProvider.otherwise('/');
//satellizer function, which we are not using anymore. 
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
//satellizer function, which we are not using anymore. 

	function skipIfLoggedIn($q, $auth) {
	      var deferred = $q.defer();
	      if ($auth.isAuthenticated()) {
	        deferred.reject();
	      } else {
	        deferred.resolve();
	      }
	      return deferred.promise;
	    }
//satellizer function, which we are not using anymore. 

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
//Related to satellizer, which we are not using anymore. 

.controller('LoginController', function($scope, $auth, $location, $http) {


    $scope.authenticate = function(provider) {
      $auth.authenticate(provider)
      .then(function(response) {
          var test = response.data;

          console.log('this is suppose to be the current logged user', test);
          console.log('You have successfully signed in with ' + provider + '!');
          $location.path('/profile')
         $http.post('/api/me', {user: test}).then(function(result) {
          console.log("This is the users data on the frontEnd", result);
         })
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


//Related to satellizer, which we are not using anymore. 

.controller('LogoutController', function($location, $auth) {
    if (!$auth.isAuthenticated()) { return; }
    $auth.logout()
      .then(function() {
        $location.path('/');
      });
  })


.factory('Account', function($http, $window) {

    return {
      getProfile: function() {
          return $http.get('/account');
      
      },
      //sets the value, of whether the user is logged in, into the localStorage. 
      setData: function(val) {
            $window.localStorage && $window.localStorage.setItem('notLoggedIn', val);
            return this;
          },
          //sets the value, of whether the user is logged our, into the localStorage. 
          setLoggedOutData: function(val) {
            $window.localStorage && $window.localStorage.setItem('Loggedout', val);
            return this;
          },
          //sets the value, of the display name, into the localStorage. 

      setLogInData: function(val) {
            $window.localStorage && $window.localStorage.setItem('UserDisplayName', val);
            return this;
          },
          getLogInData: function() {
            return $window.localStorage && $window.localStorage.getItem('UserDisplayName');
          },
          //another check to login, used to make separate decisions on whether the user is already logged in or logged out.
          setCheckingIfLogInData: function(val) {
            $window.localStorage && $window.localStorage.setItem('loggedIn', val || 1);
            return this;
          },
          getCheckingIfLogInData: function() {
            return $window.localStorage && $window.localStorage.getItem('loggedIn');
          },
          getLoggedOutData: function() {
            return $window.localStorage && $window.localStorage.getItem('Loggedout');
          },
          getData: function() {
            return $window.localStorage && $window.localStorage.getItem('notLoggedIn');
          },
      updateProfile: function(profileData) {
        return $http.put('/api/me', profileData);
      }
    };
})

.controller('NavbarController', function($scope, $auth, $http, $window, Account) {
  console.log("This is the document cookie", document.cookie);
  $scope.clickedLogin = function() {
    Account.setLoggedOutData(false);
    Account.setData(true);
    Account.setCheckingIfLogInData(2);
  };
  $scope.goingToLogOut = function() {
    Account.setLoggedOutData(true);
  };
  $scope.isAuthenticated = function() {
    return $http.get('/checkIfLoggedIn').then(function(response){
      return response.data.loggedIn;
  });
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
}])
.controller('LogoutController', ['$scope', '$http', '$state','$window','Account', function($scope, $http, $state, $window, Account){

/*   Update for ShareWith Feature
      $http.get('/isLoggedOut', {displayName: Account.getLogInData()});      
*/      delete $window.localStorage.UserDisplayName;
      
      //get request to set the user's loggedIn property in the database to false. 
      $state.go('login');
}]);

