angular.module('myApp')
	.controller('NavbarController', ['$scope', '$http', '$window', 'Account', '$rootScope', function($scope, $http, $window, Account, $rootScope) {
	  $scope.clickedLogin = function() {
	    Account.setCheckIfLoggedOut(false);
	    $rootScope.loggedIn = true;
	    Account.setChekIfActivelyLoggedIn(true);
	    Account.setCheckingIfLogInData(2);
	 

	    $scope.checkModel = {
	      login: true,
	      logout: false,
	      profile: false,
	      codeshare: false,
	      inbox: false
	    };
	  };
	  $scope.goingToLogOut = function() {
	  	console.log('this is what happend')
	    Account.setCheckIfLoggedOut(true);
	  };

	  $scope.login = function (){
	  	console.log('This is working in NavbarController')
	  };

	  $scope.login();




	}]);