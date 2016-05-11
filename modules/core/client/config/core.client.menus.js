(function () {
  'use strict';

  angular
    .module('core')
    .run(menuConfig);

  menuConfig.$inject = ['sideNavs'];

  function menuConfig(sideNavs) {
    sideNavs.addSideNav('account', {
      roles: ['user']
    });

    sideNavs.addSideNavItem('account', {
      title: '',
      state: 'settings',
      type: 'dropdown',
      roles: ['user']
    });

    sideNavs.addSubSideNavItem('account', 'settings', {
      title: 'Edit Profile',
      state: 'settings.profile'
    });

    sideNavs.addSubSideNavItem('account', 'settings', {
      title: 'Edit Profile Picture',
      state: 'settings.picture'
    });

    sideNavs.addSubSideNavItem('account', 'settings', {
      title: 'Change Password',
      state: 'settings.password'
    });

    sideNavs.addSubSideNavItem('account', 'settings', {
      title: 'Manage Social Accounts',
      state: 'settings.accounts'
    });
  }
}());
