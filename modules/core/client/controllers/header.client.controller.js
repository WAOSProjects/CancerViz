
(function () {
  'use strict';

  angular
    .module('core')
    .controller('HeaderController', HeaderController);

  HeaderController.$inject = ['$scope', '$state', 'Authentication', 'navs'];

  function HeaderController($scope, $state, Authentication, navs) {
    var vm = this;

    vm.authentication = Authentication;
    vm.isCollapsed = false;
    vm.nav = navs.getNav('topbar');

    $scope.$on('$stateChangeSuccess', stateChangeSuccess);

    function stateChangeSuccess() {
      // Collapsing the menu after navigation
      vm.isCollapsed = false;
    }
  }
}());
