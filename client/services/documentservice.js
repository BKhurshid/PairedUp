angular.module('myApp')
  .factory('documentData', ['$http', function($http) {
      
      var obj = {
        documents: ['code'],
        allDocs: []
      }

      obj.getAllDocs = function () {

        return $http.get('/getuserdocs')

      }

      return obj;
}])
