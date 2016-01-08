angular.module('myApp')
	.controller('FutureSkillsController', ['$scope','profiledata', 'Account', function($scope, profiledata, Account){
		$scope.profile;


	Account.getProfile().success(function(data){
		  $scope.profile = data.profile.github
		  console.log('this is the data.profile:', data.profile)
	})

		$scope.add = function(){
			profiledata.futureSkills({github: $scope.profile, python: $scope.python, java: $scope.java, swift: $scope.swift, go: $scope.go, ruby: $scope.ruby, angular: $scope.angular, jQuery: $scope.jQuery, html: $scope.html, css: $scope.css})
		}

	}])
