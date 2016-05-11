//Geos service used to communicate Geos REST endpoints
(function () {
  'use strict';

  angular
    .module('geos')
    .factory('GeosService', GeosService);

  GeosService.$inject = ['$resource'];

  function GeosService($resource) {
    return $resource('api/geos/:geoId', {
      geoId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
})();
