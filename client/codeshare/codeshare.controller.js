angular.module('myApp')
.factory('socket', ['$rootScope', function($rootScope) {
  var socket = io.connect("http://localhost:8080");
  return {
    on: function(eventName, callback){
      socket.on(eventName, callback);
    },
    emit: function(eventName, data) {
      socket.emit(eventName, data);
    }
  };
}])

.controller('CodeShareController', ['$scope','$http', '$state','$window','socket','Account', '$log', 'profiledata', function($scope, $http, $state, $window,  socket, Account, $log, profiledata){ 
  $scope.isCollapsed = false;
  $scope.toUsername;
  $scope.joinedRoom;
  $scope.allChats;
  $scope.toUserInfo;
  $scope.fromUser;
  $scope.allMsg
  $scope.otherRoom
  $scope.profile;
  $scope.fromUser
  $scope.allUsers = []; 
  $scope.filesList = [];
  $scope.id = 0;
  $scope.removeid = 0;
  $scope.modes = ['Scheme', 'XML', 'Javascript', 'HTML', 'Ruby', 'CSS', 'Curly', 'CSharp', 'Python', 'MySQL'];
  $scope.mode = $scope.modes[2];
  var coderoom = $scope.joinedRoom
  

  ///////////////////////////////////////////////////////////////////////////
  ////Imported Contacts list
  //////////////////////////////////////////////////////////////////////////

  var account = Account.getUserDisplayName()
  profiledata.findUser({user:account}).then(function(results){
      $scope.profile = results.displayName
      $scope.fromUser = results
  });
  
  profiledata.getAllUsers().success(function(data){
    for (var i=0; i<data.length; i++){
      $scope.allUsers.push(data[i])

    }
  });

  $scope.initChat = function (user){
    socket.emit('writeToUser', {toUser: user, fromUser:$scope.fromUser})
    $state.go('chat.contacts')
  };

  $scope.initSharing = function(user) {
    $scope.id++;
    socket.emit("startLiveEditing", {toName: user, fromName: Account.getUserDisplayName()});
    var total = $scope.id + $scope.removeid;
    socket.emit('startsharing', {toUser: user, fromUser:$scope.fromUser, id: total, title: $scope.title, code: $scope.aceModel, mode: $scope.mode })
  };

  ///////////////////////////////////////////////////////////////////////////
  ////End - Imported Contacts list 
  //////////////////////////////////////////////////////////////////////////

  $scope.textInEditor = $scope.aceModel;
  $scope.doc;
  $scope.aceOption = {
    theme:'twilight',
    mode: $scope.mode.toLowerCase(),
    onLoad: function (_ace) {
      $scope.modeChanged = function () {
          _ace.getSession().setMode("ace/mode/" + $scope.mode.toLowerCase());
          
      };
      //store the document of the session to a variable. 
      $scope.doc = _ace.getSession().getDocument();
    },
    onChange: function(_ace) {
      //store the document of the session to a variable.  
            var sessionDoc = _ace[1].getSession().getDocument();
            if ($scope.textInEditor !== sessionDoc.getValue() ) {
              //setting $scope.textInEditor equal to the text in the document
              $scope.textInEditor = sessionDoc.getValue();
               socket.emit($scope.title, {title: $scope.title, textFromDoc: $scope.textInEditor});
            }
           
            socket.on('notification', function(data) {
              if ($scope.textInEditor !== data.textFromDoc){
                if ($scope.title === data.title) {
                  $scope.textInEditor = data.textFromDoc;
                  //change the user's document to reflect the other's typing. 
                  sessionDoc.setValue($scope.textInEditor);
                  }
              }
            });
          }
        };
     
  $scope.aceModel = ';; Scheme code in here.\n' +
    '(define (double x)\n\t(* x x))\n\n\n' +
    '<!-- XML code in here. -->\n' +
    '<root>\n\t<foo>\n\t</foo>\n\t<bar/>\n</root>\n\n\n' +
    '// Javascript code in here.\n' +
    'function foo(msg) {\n\tvar r = Math.random();\n\treturn "" + r + " : " + msg;\n}';
 
  

 //file types to add to the document name. 
  $scope.fileTypes = {'Scheme': '.sch', 'XML' : '.xml', 'Javascript': '.js', 'HTML': '.html' , 'Ruby': '.rb' , 'CSS': '.css' , 'Curly': '.curly' , 'CSharp': '.csharp' , 'Python': '.py' , 'MySQL': '.sql' };
//retrieving all the files if the user is logged in. 
  if (Account.getCheckIfLoggedOut() === 'false') {
      $http.post('/retrievingDocumentsForUser', {displayName: Account.getUserDisplayName(), code: $scope.aceModel})
      .then(function(result) {
        for (var i = 0; i < result.data.length; i++) {
          $scope.id++;
          $scope.filesList.push(result.data[i]);
        }
      }, function(err) {
        console.log("there was an error");
      });
    }



  $scope.add = function(){
    $scope.id++;
    var total = $scope.id + $scope.removeid;
    $scope.filesList.push({id: total, title: $scope.title, code: $scope.aceModel, mode: $scope.mode});
    $scope.filesList[total - 1].title += $scope.fileTypes[$scope.mode];
    $http.post('/savingDocumentsToDatabase', {id: total, title: ($scope.title + $scope.fileTypes[$scope.mode]), mode: $scope.mode, displayName: Account.getUserDisplayName(), code: $scope.aceModel});  
    $scope.title = '';
    $scope.aceModel = '';
  };

  $scope.update = function(id){
    var index = selectId($scope.idOfCurrentDoc);
    $scope.filesList[index].title = $scope.title;
    $scope.filesList[index].code = $scope.aceModel;
    $scope.filesList[index].mode = $scope.mode;
    $scope.title = '';
    $scope.aceModel = '';
    $scope.idOfCurrentDoc = null;
  };

  $scope.shareWith = function(username) {
    socket.emit('/create', {title:$scope.title});
  };

  $scope.edit = function(id){
    var index = selectId(id);
    var item = $scope.filesList[index];
    $scope.title = item.title;
    $scope.aceModel = item.code;
    $scope.mode = item.mode;

    $scope.idOfCurrentDoc = id;
  };

  $scope.delete = function(id){
    var index = selectId(id);
    var index = selectId($scope.idOfCurrentDoc);
    var item = $scope.filesList[index];
    var store = $scope.filesList[$scope.removeid];
    $http.post('/deleteDocumentsForUser', {displayName: Account.getUserDisplayName(), title: item.title, id:item.id}).then(function(result) {
    }).then(function() {
      $scope.id = 0; 
      $scope.filesList = [];
      $http.post('/retrievingDocumentsForUser', {displayName: Account.getUserDisplayName(), code: $scope.aceModel})
      .then(function(result) {
        for (var i = 0; i < result.data.length; i++) {
          $scope.id++;
          $scope.filesList.push(result.data[i]);
        }
      }, function(err) {
        console.log("there was an error");
      });


    });
    $scope.removeid = 0;
    $scope.id--;
    $scope.title = '';
    $scope.aceModel = '';
    

  };

  function selectId (id){
    for(var i = 0; i < $scope.filesList.length; i++){
      if($scope.filesList[i].id === id){
        return i;
      }
    }
  };

  $scope.endLiveCodeShare = function() {
    Account.setTitle(null);
    $window.location.reload();
  };
  $scope.liveCodeShare = function() {
    socket.emit("startLiveEditing", {toName: $scope.text, fromName: Account.getUserDisplayName()});
  };
  
  socket.on("mediumLiveEdit", function(data) {
    if (Account.getUserDisplayName() === data.toName || Account.getUserDisplayName() === data.fromName){
      // confirm whether both want to go to the codeshare
      var goToCodeShare = $window.confirm("Go to live Code Share?");
      if (goToCodeShare) {
        Account.setTitle(data.toName + data.fromName);
        $window.location.reload();
      }    
    } 
  });

  if (Account.getTitle() && Account.getTitle() !== 'null') {
    $scope.title = Account.getTitle();
    $scope.add();
    var idOfTitle;
    for (var i = 0; i < $scope.filesList.length; i++) {
      var title = $scope.filesList[i].title.split('.')[0];
      if (title === Account.getTitle()) {
        idOfTitle = $scope.filesList[i].id;
      }
    }
    $scope.edit(idOfTitle);
    $scope.shareWith();
  }

  $scope.status = {
    isopen: false
  };

  $scope.toggled = function(open) {
    $log.log('Dropdown is now: ', open);
  };

  $scope.toggleDropdown = function($event) {
    $event.preventDefault();
    $event.stopPropagation();
    $scope.status.isopen = !$scope.status.isopen;
  };

}]);