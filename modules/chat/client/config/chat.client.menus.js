(function () {
  'use strict';

  angular
    .module('chat')
    .run(menuConfig)
    .constant('appInformation', {
      view: '/home'
    });

  menuConfig.$inject = ['sideNavs'];

  function menuConfig(sideNavs) {
    // Set top bar menu items
    // sideNavs.addSideNavItem('sidebar', {
    //   title: 'Chat',
    //   state: 'chat',
    //   icon: 'fa-comment-o',
    //   color: '#2980b9',
    //   fontColor: '#fff',
    //   type: 'item',
    //   roles: ['*'],
    //   view: 'home'
    // });
  }
}());
