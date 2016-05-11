(function () {
  'use strict';

  angular
    .module('chat.routes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider', 'appInformation'];

  function routeConfig($stateProvider, appInformation) {
    $stateProvider
      .state('chat', {
        url: appInformation.view + '/chat',
        templateUrl: 'modules/chat/client/views/chat.client.view.html',
        controller: 'ChatController',
        controllerAs: 'vm',
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Chat'
        }
      });
  }
}());
