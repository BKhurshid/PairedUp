angular.module('myApp')
  .controller('ProfileController', function($scope, $http, $auth,$q, $state,$window, Account) {
    var loggedInInformation; 
    $scope.getProfile = function() {
      Account.setData(false); 
      //set promise variable to equal return of Account.getProfile so we can chain promise and fix the check for the req.sessions once someone immediately logs in. 
      var promise = Account.getProfile()
        .then(function(response) {
          //data binding to show on the html page
          $scope.user = response.data.profile;
          //sets the displayName in the local Storage of the browser. 
          Account.setLogInData(response.data.profile.displayName);
          return {};
        })
        .catch(function(response) {
        });
        return promise;
    };
    /*
    $scope.updateProfile = function() {
      Account.updateProfile($scope.user)
        .then(function() {
          // toastr.success('Profile has been updated');
        })
        .catch(function(response) {
          // toastr.error(response.data.message, response.status);
        });
    };

These functions are for the deployed version and I am not up to date on their purpose.

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
    
 */
 //the first time a user comes to the profile page without signing in. 
    if (Account.getCheckingIfLogInData() === null) {
      Account.setCheckingIfLogInData(1);
      Account.setLoggedOutData(true);
    }
    //if the person is not logged 
     if (Account.getData() && Account.getCheckingIfLogInData() != 1) {
      //setting a check to tell the code that the user is logged in
      Account.setCheckingIfLogInData(1);
      //accessing the github passport. 
      $scope.getProfile().then(function() {


     }, function(err) {
       console.log("This is a err", err);
     });
      //A outer chekc to see if the user is logged in or not
    }else if (Account.getCheckingIfLogInData() == 1 ){
      //if they are not logged in, then redirect them to the login page.
      if (Account.getLoggedOutData() == 'true') {
        // console.log('getLoggedOutData in if ',Account.getLoggedOutData());
        // console.log("Logged out is true");
        // // Account.setCheckingIfLogInData(0);
        $state.go('login');

        //else if they are already logged in. 
      } else {
        //   console.log("LoggedOUt is false");
       
        // console.log("In the if in userProfile");
        // bit of a glitch, after every so many log ins, the profile page will not display the users information. Not sure how this is happening (Dec 20th)
        //send the display name to the backend, where will we will search for the user in the database. 
        $http.post('/getFromDatabaseBecausePersonSignedIn', 
                   {displayName: Account.getLogInData()})
          .success(function(data, status) {
            // console.log("data from server", data);
            //databind to show the information (picture, display name)
              $scope.user = data.user;
          });
    }
    }
  });