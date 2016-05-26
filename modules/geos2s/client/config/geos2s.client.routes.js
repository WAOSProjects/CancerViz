(function () {
  'use strict';

  angular
    .module('geos2s')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
        .state('geos2s', {
          abstract: true,
          url: '/geos2s',
          template: '<ui-view/>'
        })
        .state('geos2s.global', {
          url: '/global',
          templateUrl: 'modules/geos2s/client/views/global-geo2.client.view.html',
          controller: 'Geos2sListController',
          controllerAs: 'vm',
          data: {
            pageTitle: 'Geos2 List'
          }
        });
  }




  getGeos2.$inject = ['$stateParams', 'Geos2sService'];

  function getGeos2($stateParams, Geos2sService) {
    return Geos2sService.get({
      geos2Id: $stateParams.geos2Id
    }).$promise;
  }

  newGeos2.$inject = ['Geos2sService'];

  function newGeos2(Geos2sService) {
    return new Geos2sService();
  }
})();
