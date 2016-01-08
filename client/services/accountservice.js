angular.module('myApp')
.factory('Account', function($http, $window) {

  return {
    getProfile: function() {
      return $http.get('/account')
      .success(function(req, res){
       
        var username = req.profile.displayName;

        return username;
      });
      
    },

    setChekIfActivelyLoggedIn: function(val) {
      $window.localStorage && $window.localStorage.setItem('notLoggedIn', val);
      return this;
    },
          //sets the value, of whether the user is logged our, into the localStorage. 
          setCheckIfLoggedOut: function(val) {
            $window.localStorage && $window.localStorage.setItem('Loggedout', val);
            return this;
          },
          //sets the value, of the display name, into the localStorage. 
          storeUserDisplayName: function(val) {
            $window.localStorage && $window.localStorage.setItem('UserDisplayName', val);
            return this;
          },
          getUserDisplayName: function() {
            return $window.localStorage && $window.localStorage.getItem('UserDisplayName');
          },
          //another check to login, used to make separate decisions on whether the user is already logged in or logged out.
          setCheckingIfLogInData: function(val) {
            $window.localStorage && $window.localStorage.setItem('loggedIn', val || 1);
            return this;
          },
          getCheckingIfLogInData: function() {
            return $window.localStorage && $window.localStorage.getItem('loggedIn');
          },
          getCheckIfLoggedOut: function() {
            return $window.localStorage && $window.localStorage.getItem('Loggedout');
          },
          getChekIfActivelyLoggedIn: function() {
            return $window.localStorage && $window.localStorage.getItem('notLoggedIn');
          },

          updateProfile: function(profiledata) {
            return $http.put('/api/me', profiledata);
          },

          setTitle: function(val) {
            return $window.localStorage && $window.localStorage.setItem('liveCodeShare', val);
          },
          getTitle: function() {
            return $window.localStorage && $window.localStorage.getItem('liveCodeShare');
          }
        };
      });