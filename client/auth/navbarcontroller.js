angular.module('myApp')
	.controller('NavbarController', ['$scope', '$http', '$window', 'Account', '$rootScope', function($scope, $http, $window, Account, $rootScope) {
	  $scope.loggedin = Account.getChekIfActivelyLoggedIn();
	  console.log('this is the loggin', Account.getChekIfActivelyLoggedIn())
	  $scope.clickedLogin = function() {
	    Account.setCheckIfLoggedOut(false);
	    $rootScope.loggedIn = true;
	    Account.setChekIfActivelyLoggedIn(true);
	    Account.setCheckingIfLogInData(2);
	  	$scope.loggedin = Account.getChekIfActivelyLoggedIn();
	  };
	  $scope.goingToLogOut = function() {
	    Account.setCheckIfLoggedOut(true);
	  };

	}]);