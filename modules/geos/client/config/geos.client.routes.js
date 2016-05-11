(function () {
  'use strict';

  angular
    .module('geos')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('geos', {
        abstract: true,
        url: '/geos',
        template: '<ui-view/>'
      })
      .state('geos.global', {
        url: '/global',
        templateUrl: 'modules/geos/client/views/global-geo.client.view.html',
        controller: 'GeosController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Geos List'
        }
      })
      .state('geos.multi', {
        url: '/multi',
        templateUrl: 'modules/geos/client/views/multi-geo.client.view.html',
        controller: 'GeosMultiController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Geos List'
        }
      });
  }

  getGeo.$inject = ['$stateParams', 'GeosService'];

  function getGeo($stateParams, GeosService) {
    return GeosService.get({
      geoId: $stateParams.geoId
    }).$promise;
  }

  newGeo.$inject = ['GeosService'];

  function newGeo(GeosService) {
    return new GeosService();
  }
})();
