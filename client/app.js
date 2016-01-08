angular.module('myApp', [
	'ui.router',
	'ui.ace',
  'ui.bootstrap',
  'btford.socket-io',
  'ngAnimate'
  // 'xeditable'
  ])

.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function($stateProvider, $urlRouterProvider, $locationProvider){

  $stateProvider
  
  .state('login', {
    url: '/login',
    templateUrl: 'auth/login/login.html',
    controller: 'NavbarController'

  })

  .state('logout', {
    url: '/logout',
    template: null,
    controller: 'LogoutController'
  })
  .state('home', {
    url:'/home',
    templateUrl: 'home/home.html',
    controller: 'HomeController',
  })

  .state('profile', {
    url: '/profile',
    templateUrl: 'userprofile/userprofile.html',
    controller: 'ProfileController'
  })

  .state('profile.currentskills', {
    url: '/currentskills',
    templateUrl: 'userprofile/currentskills.html',
    controller: 'CurrentSkillsController'
  })

  .state('profile.futureskills', {
    url: '/futureskills',
    templateUrl: 'userprofile/futureskills.html',
    controller: 'FutureSkillsController'
  })

  .state('profile.summary', {
    url: '/summary',
    templateUrl: 'userprofile/summary.html',
    controller: 'SummaryController'
  })

  .state('codeshare', {
    url: '/codeshare',
    templateUrl: 'codeshare/codeshare.html',
    controller: 'CodeShareController'
  })

  .state('codeshare.room2', {
    url: '/room/:roomId',
    templateUrl: 'codeshare/room.html',
    controller: 'RoomCtrl'
  })

  .state('codeshare.room', {
    url: '/room',
    templateUrl: 'codeshare/room.html',
    controller: 'RoomCtrl'
  })
  .state('codeshare.contact', {
    url: '/contact',
    templateUrl: 'codeshare/contactlist.html',
    controller: 'CodeShareController'
  })

  .state('chat', {
    url: '/chat',
    templateUrl: 'chat/chat.html',
    controller: 'ChatController'
  })

  .state('chat.rooms', {
    url: '/chatrooms',
    templateUrl: 'chat/chatrooms.html',
    controller: 'ChatRoomController'
  })

  .state('chat.contacts', {
    url: '/contacts',
    templateUrl: 'chat/contacts.html',
    controller: 'ContactController'
  })


  $urlRouterProvider.otherwise('/login');


}])

Object.setPrototypeOf = Object.setPrototypeOf || function(obj, proto) {
  obj.__proto__ = proto;
  return obj;
};
