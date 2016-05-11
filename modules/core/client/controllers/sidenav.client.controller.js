(function () {
  'use strict';

  angular
    .module('core')
    .controller('SidenavController', SidenavController);

  SidenavController.$inject = ['$scope', '$state', 'Authentication', 'sideNavs'];

  function SidenavController($scope, $state, Authentication, sideNavs) {
    var vm = this;

    vm.authentication = Authentication;
    vm.$state = $state;
    vm.sideNav = sideNavs.getSideNav('sidebar');

  }
}());
