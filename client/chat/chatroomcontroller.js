angular.module('myApp')
	.controller('ChatRoomController', ['$scope', 'Account', 'socket', 'profiledata', function($scope, Account, socket, profiledata){
		
	$scope.roomname =[]

		 


	var account = Account.getUserDisplayName()

	socket.on('roomlist', function(data){
			console.log('this is data in roomlist', data)
	})
	socket.on('checkforroom', function(data){
		console.log('this is a room', data)
	})
	$scope.findUser = function (){
		profiledata.findUser({user:account}).then(function(results){
			$scope.roomname = results.data.chatroom
			for(var i=0; i<$scope.roomname.length; i++){

			}
			console.log('these are the results', $scope.roomname)
			})
	}
	$scope.findUser()
	
	$scope.userjoin = function(roomname, chatwith){
		socket.emit('userjoin', {joinedroom:roomname, chatwith:chatwith, chatter:account})
	}

	}])
