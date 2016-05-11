(function () {
  'use strict';

  angular
    .module('core')
    .controller('HomeController', HomeController);

  HomeController.$inject = ['$scope', '$state', 'Authentication', 'appStore', '_'];

  function HomeController($scope, $state, Authentication, appStore, _) {
    var vm = this;
    vm.authentication = Authentication;
    vm.appStore = appStore.getappStore('appDiv');
    vm.error = [];

    vm.get = get();

    function get() {
      var app = _.filter(vm.appStore.items, { 'state': $state.params.appstoreId });
      if(app.length === 1){
        return app[0];
      }else {
        vm.error.push('No application found');
        return [];
      }
    }
  }
}());
