angular.module('myApp')
  .controller('CurrentSkillsController', ['$scope','profiledata', 'Account', function($scope, profiledata, Account){
    $scope.currentskills = profiledata.skills;
    $scope.profile;

    Account.getProfile().success(function(data){
       $scope.profile = data.profile.github
       console.log('this is the data.profile:', data.profile)
     })

    $scope.add = function(){
      profiledata.addSkills({github: $scope.profile, node:$scope.node, angular:$scope.angular, 
        html:$scope.html, css:$scope.css, jquery:$scope.jquery})
    }

    $scope.addfuture = function(){
      profiledata.futureSkills({github: $scope.profile, python: $scope.python, java: $scope.java, swift: $scope.swift, go: $scope.go, ruby: $scope.ruby, angular: $scope.angular, jQuery: $scope.jQuery, html: $scope.html, css: $scope.css})
    }

  }]);
