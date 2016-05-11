(function () {
  'use strict';

  angular
    .module('core')
    .run(routeFilter);

  routeFilter.$inject = ['$rootScope', '$state', 'Authentication'];

  function routeFilter($rootScope, $state, Authentication) {

    Authentication.ready
      .then(function (auth) {
        $rootScope.$on('$stateChangeStart', stateChangeStart);
      });

    $rootScope.$on('$stateChangeSuccess', stateChangeSuccess);

    function stateChangeStart(event, toState, toParams, fromState, fromParams) {
      // Check authentication before changing state
      if (toState.data && toState.data.roles && toState.data.roles.length > 0) {
        var allowed = false;

        for (var i = 0, roles = toState.data.roles; i < roles.length; i++) {
          if ((roles[i] === 'guest') || (Authentication.user && Authentication.user.roles !== undefined && Authentication.user.roles.indexOf(roles[i]) !== -1)) {
            allowed = true;
            break;
          }
        }

        if (!allowed) {
          event.preventDefault();
          if (Authentication.user !== undefined && typeof Authentication.user === 'object') {
            $state.transitionTo('forbidden');
          } else {
            $state.go('authentication.signin').then(function () {
              // Record previous state
              storePreviousState(toState, toParams);
            });
          }
        }
      }
    }

    function stateChangeSuccess(event, toState, toParams, fromState, fromParams) {
      // FIXME
      var views = ['tiers', 'tiersWallet'];
      if (window._.findIndex(views, $state.href(toState, toParams).split('/')[1]) === -1) {
        $rootScope.view = 'home';
      } else {
        $rootScope.view = $state.href(toState, toParams).split('/')[1];
      }
      storePreviousState(fromState, fromParams);
      $rootScope.location = toState.name.split('.').map(function(val) {
        if (val !== '') {
          return {
            'value': val.charAt(0).toUpperCase() + val.slice(1) + ' / ',
            'state': val
          };
        } else {
          return '';
        }
      });
      $rootScope.location[$rootScope.location.length - 1].state = '';
      $rootScope.location[$rootScope.location.length - 1].value = $rootScope.location[$rootScope.location.length - 1].value.slice(0, -2);
    }

    // Store previous state
    function storePreviousState(state, params) {
      // only store this state if it shouldn't be ignored
      if (!state.data || !state.data.ignoreState) {
        $state.previous = {
          state: state,
          params: params,
          href: $state.href(state, params)
        };
      }
    }
  }
}());
