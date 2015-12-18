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

.controller('LoginController', function($scope, $auth, $location, $http) {


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

/*

  Nav Bar Controller

*/

.controller('NavbarController', function($scope, $auth, $http) {
  console.log("This is the document cookie", document.cookie);
  $scope.isAuthenticated = function() {
    // return $auth.isAuthenticated();
    return $http.get('/checkIfLoggedIn').then(function(response){
      return response.data.loggedIn;
    // console.log("response from checkIfLoggedIn", response);
  });
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


.factory('Account', function($http, $window) {

    return {
      getProfile: function() {
        console.log('inside the factory-------------');
          return $http.get('/account')
        // .then(function(req, res){
        //   console.log('this is a successful callback of /account', res);
        //   console.log('this is a successful callback of /account for req', req);
        //   console.log(typeof req);
        //   // var test = JSON.parse(req);
        //   // console.log(test);
        //   console.log('this is req.data.whatever', req.data.profile.username)
        //   // $scope.username = req.data.profile.username;
        // })
      
      },
      setData: function(val) {
            $window.localStorage && $window.localStorage.setItem('notLoggedIn', val);
            return this;
          },
      setLogInData: function(val) {
            $window.localStorage && $window.localStorage.setItem('UserDisplayName', val);
            return this;
          },
          getLogInData: function() {
            return $window.localStorage && $window.localStorage.getItem('UserDisplayName');
          },
          getData: function() {
            return $window.localStorage && $window.localStorage.getItem('notLoggedIn');
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

    //When someone clicks the submit button for the template chat.
    $scope.submit = function() {
        //if there is text in the box.
        if ($scope.text) {
            //emit a new message with the text data. Will store this in the database. 
            socket.emit('new message', {text: $scope.text});
        }
    };
}])
.controller('LogoutController', ['$scope', '$http', '$state','$window','Account', function($scope, $http, $state, $window, Account){
  console.log("Hello")
      // delete $window.localStorage.UserDisplayName;
      Account.setData(false);
      console.log("day")
      $state.go('login');
}]);

