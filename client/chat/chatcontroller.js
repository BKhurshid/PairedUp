angular.module('myApp')
.controller('ChatController', ['$scope', '$http', 'socket', '$filter', 'Account', function($scope, $http, socket, $filter, Account){
	$scope.toUsername;
	$scope.joinedRoom;
	$scope.allChats;
	$scope.toUser;
	$scope.fromUser;
	$scope.allMsg;
	$scope.otherRoom;
	$scope.username = Account.getUserDisplayName();

	socket.on('savedroom', function(data){
		console.log('from saved room',data)
	});

 		socket.on('composeToUser', function(data){
 			$scope.$apply(function(){
 				$scope.toUsername = data.toUser.displayName
 				$scope.toUser = data.toUser.displayName
 				$scope.fromUser = data.fromUser
 				$scope.joinedRoom = data.roomname
 				$scope.otherRoom = data.othername
 			});
 		});

	    socket.on("publish message", function(data) {
	        $scope.$apply(function(){
	        	$scope.allChats = data;	        
	        });
	    })

	socket.on('updatechat', function(data){
		$scope.$apply(function(){
			$scope.allMsg = data
		});
	});

	$scope.submit = function() {
	        //check if there is text in the box.
	        if ($scope.text) {
	        	socket.emit('new message', {text: $scope.text, date: $filter('date')(new Date(), 'MM/dd/yyyy h:mma'), fromUser: $scope.username, toUser: $scope.toUsername, joinedroom: $scope.joinedRoom, otherroom: $scope.otherRoom});
	        }
	        $scope.text = "";
	      };
	    }]);

