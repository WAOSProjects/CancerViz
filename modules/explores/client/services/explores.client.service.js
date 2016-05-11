//Explores service used to communicate Explores REST endpoints
(function () {
  'use strict';

  angular
    .module('explores')
    .factory('ExploresServiceDeathsYears', ExploresServiceDeathsYears);

  ExploresServiceDeathsYears.$inject = ['$resource'];

  function ExploresServiceDeathsYears($resource) {
    return $resource('api/explores/deathsYears/:exploreId', {
      exploreId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
})();


(function () {
  'use strict';

  angular
    .module('explores')
    .factory('ExploresServiceDeathsCancers', ExploresServiceDeathsCancers);

  ExploresServiceDeathsCancers.$inject = ['$resource'];

  function ExploresServiceDeathsCancers($resource) {
    return $resource('api/explores/deathsCancers/:exploreId', {
      exploreId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
})();


(function () {
  'use strict';

  angular
    .module('explores')
    .factory('ExploresServiceRisqsCancers', ExploresServiceRisqsCancers);

  ExploresServiceRisqsCancers.$inject = ['$resource'];

  function ExploresServiceRisqsCancers($resource) {
    return $resource('api/explores/risqsCancers/:exploreId', {
      exploreId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
})();
