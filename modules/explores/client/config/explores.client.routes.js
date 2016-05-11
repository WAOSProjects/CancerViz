(function () {
  'use strict';

  angular
    .module('explores')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('explores', {
        abstract: true,
        url: '/explores',
        template: '<ui-view/>'
      })
      .state('explores.view', {
        url: '',
        templateUrl: 'modules/explores/client/views/view-explore.client.view.html',
        controller: 'ExploresController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Explores List'
        }
      });
  }

  getExplore.$inject = ['$stateParams', 'ExploresService'];

  function getExplore($stateParams, ExploresService) {
    return ExploresService.get({
      exploreId: $stateParams.exploreId
    }).$promise;
  }

  newExplore.$inject = ['ExploresService'];

  function newExplore(ExploresService) {
    return new ExploresService();
  }
})();
