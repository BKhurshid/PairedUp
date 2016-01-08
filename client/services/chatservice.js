angular.module('myApp')
	.factory('Chat', ['$http', '$q', function($http, $q){
		var obj = {

		}
		//grabs the username of the person that wants to chat. 
		obj.initChat = function(user){
			return $http.get('/initChat', user)
		}

		obj.getChat = function(users) {
			var defer = $q.defer()
			 $http.post('/chats', users).success(function(data){
			 	obj.chats = data
			 	console.log(obj.chats)
				defer.resolve(data)
			}).error(function(err, status){
				defer.reject(err)
			})
			return defer.promise;
		};

		return obj;
	}])
