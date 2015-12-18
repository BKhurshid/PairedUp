angular.module('myApp')
  .controller('ProfileController', function($scope, $http, $auth,$q, Account) {
    var loggedInInformation; 
    $scope.getProfile = function() {
      // console.log("Before setting to false Account.notLoggedIn", Account.notLoggedIn);
      Account.setData(true); 
      // console.log("After setting to false Account.notLoggedIn", Account.notLoggedIn);
      //set promise variable to equal return of Account.getProfile so we can chain promise and fix the check for the req.sessions once someone immediately logs in. 
      var promise = Account.getProfile()
        .then(function(response) {
          console.log('inside profile controller------ profile', response.data.profile);
          // console.log('this is the response', response);
          $scope.user = response.data.profile;
          Account.setLogInData(response.data.profile.displayName);
          // loggedInInformation = response.data.profile;
          console.log("loggedInInformation in get profile function", loggedInInformation);
          //returned this because it chains the promise.
          return {};
        })
        .catch(function(response) {
          // toastr.error(response.data.message, response.status);
        });
        // return deferred.promise; 
        return promise;
    };
    
    $scope.updateProfile = function() {
      Account.updateProfile($scope.user)
        .then(function() {
          // toastr.success('Profile has been updated');
        })
        .catch(function(response) {
          // toastr.error(response.data.message, response.status);
        });
    };
    $scope.link = function(provider) {
      $auth.link(provider)
        .then(function() {
          // toastr.success('You have successfully linked a ' + provider + ' account');
          $scope.getProfile();
        })
        .catch(function(response) {
          // toastr.error(response.data.message, response.status);
        });
    };
    $scope.unlink = function(provider) {
      $auth.unlink(provider)
        .then(function() {
          // toastr.info('You have unlinked a ' + provider + ' account');
          $scope.getProfile();
        })
        .catch(function(response) {
          // toastr.error(response.data ? response.data.message : 'Could not unlink ' + provider + ' account', response.status);
        });
    };
    
    //if the person is not logged 
    // console.log("This is account.getdata", !!Account.getData())
    if (Account.getData()) {
      console.log("In the if in userProfile")
        $scope.getProfile().then(function() {
          $http.get('/checkIfLoggedIn').then(function(response){
            // console.log("response from checkIfLoggedIn", response);
            checkifLoggedIn(response);
          });
        }, function(err) {
          console.log("This is a err", err);
        });  
    }else {
      console.log("In the else in userProfile")
      $http.post('/getFromDatabaseBecausePersonSignedIn', {id: Account.getLogInData()})
        .success(function(data, status) {
            $scope.user = data;

      // $scope.user = Account.getLogInData;
    });
    }

    var checkifLoggedIn = function(bol) {
      console.log("Need this function to beat the asynchronous response", bol)
    }
  });