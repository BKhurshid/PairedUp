angular.module('myApp')

.factory('profiledata', ['$http', '$q', function($http, $q){
	var obj = {
		skills: ['hello'],
		allUsers: []
	};

	obj.findUser = function(user){
		var defer = $q.defer()
		$http.post('/founduser', user).success(function(data){
			defer.resolve(data)
		}).error(function(err, status){
			defer.reject(err)
		});
		return defer.promise;
	};

	obj.getAll = function() {
		return $http.get('/profile').success(function(data){
			angular.copy(data, obj.skills);
		});
	};

	obj.getAllUsers = function (){
		return $http.get('/oneuserskill').success(function(data){
			console.log('data from getOneUser', data)
			for (var i=0; i<data.length; i++){
				obj.allUsers.push(data[i])	
			}
		})
	};

	obj.addSkills = function (skill) {
		return $http.post('/skills', skill);
	};

	obj.getAllUsers = function (){
		return $http.get('/oneuserskill').success(function(data){
			for (var i=0; i<data.length; i++){
				obj.allUsers.push(data[i])	
			}
		})
	};

	obj.futureSkills = function (skill) {
		return $http.post('/futureskills', skill)
	};
	
	return obj;
	
}]);

