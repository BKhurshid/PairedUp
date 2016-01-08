angular.module('myApp')
	.controller('ContactController', ['$scope', 'profiledata', 'Account', 'Chat', 'socket', '$state', '$stateParams', function($scope, profiledata, Account, Chat, socket, $state, $stateParams) {
		$scope.init = function (){
			$scope.profile;
			$scope.fromUser
			$scope.allUsers = []; 
		};
		  var account = Account.getUserDisplayName()
		  profiledata.findUser({user:account}).then(function(results){
		  	$scope.profile = results.displayName;
		  	$scope.fromUser = results;
		  });

		  profiledata.getAllUsers().success(function(data){
		  	for (var i=0; i<data.length; i++){
		  		$scope.allUsers.push(data[i])
		  	}
		  });

		  $scope.initChat = function (user){
		  	socket.emit('writeToUser', {toUser: user, fromUser:$scope.fromUser})
		  };

		  $scope.init();
	}]);