(function () {
  'use strict';

  angular
    .module('users.admin')
    .run(menuConfig);

  menuConfig.$inject = ['navs'];

  // Configuring the Users module
  function menuConfig(navs) {
    navs.addSubNavItem('topbar', 'admin', {
      title: 'Manage Users',
      state: 'admin.users'
    });
  }
}());
