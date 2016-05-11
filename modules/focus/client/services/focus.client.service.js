(function () {
  'use strict';

  angular
    .module('explores')
    .factory('ExploresServiceMustCancers', ExploresServiceMustCancers);

  ExploresServiceMustCancers.$inject = ['$resource'];

  function ExploresServiceMustCancers($resource) {
    return $resource('api/focus/mustCancers/:exploreId', {
      exploreId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
})();
