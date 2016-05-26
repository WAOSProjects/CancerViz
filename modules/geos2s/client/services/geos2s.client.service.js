//Geos2s service used to communicate Geos2s REST endpoints
(function () {
  'use strict';

  angular
    .module('geos2s')
    .factory('Geos2sService', Geos2sService);

  Geos2sService.$inject = ['$resource'];

  function Geos2sService($resource) {
    return $resource('api/geos2s/:geos2Id', {
      geos2Id: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
})();
