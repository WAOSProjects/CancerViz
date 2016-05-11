(function () {
  'use strict';

  angular
    .module('focus')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('focus', {
        abstract: true,
        url: '/focus',
        template: '<ui-view/>'
      })
      .state('focus.view', {
        url: '',
        templateUrl: 'modules/focus/client/views/view-focu.client.view.html',
        controller: 'FocusController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Focus View'
        }
      });
  }

  getFocu.$inject = ['$stateParams', 'FocusService'];

  function getFocu($stateParams, FocusService) {
    return FocusService.get({
      focuId: $stateParams.focuId
    }).$promise;
  }

  newFocu.$inject = ['FocusService'];

  function newFocu(FocusService) {
    return new FocusService();
  }
})();
