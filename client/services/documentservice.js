angular.module('myApp')
  .factory('documentData', ['$http', function($http) {
      
      var obj = {
        documents: ['code'],
        allDocs: []
      }

      obj.getAllDocs = function () {

        return $http.get('/getuserdocs')
        // success(function(data){
        //   console.log('data from getUserdocs', data)
        //   for (var i = 0; i < data.length; i++) {
        //     obj.allDocs.push(data[i])  
        //   }
        // })
      }

      return obj;
}])
