(function () {
  'use strict';

  angular
    .module('articles')
    .run(menuConfig)
    .constant('appInformation', {
      view: '/home'
    });

  menuConfig.$inject = ['sideNavs', 'navs', 'appStore'];

  function menuConfig(sideNavs, navs, appStore) {
    /****************************
     * Globals vars
     ****************************/
    var _app = {
      name: 'Articles',
      version: '1.0.0',
      view : 'home', // app view, tiers, tiersWallet, home
      state: 'articles.list', //main route
      icon: 'fa-newspaper-o', //https://fortawesome.github.io/Font-Awesome/
      color: '#f39c12', //https://flatuicolors.com/ (sideNav)
      fontColor: '#fff', //https://flatuicolors.com/ (sideNav)
      position: 1, //default 1
      tags: ['News', 'Articles', 'Publication'], //max 5
      preview: 'modules/core/client/img/article.png',
      excerpt: 'Section Blog afin d\'expliquer les Maj, démarches, et nouveautés.',
      screenshots: {
        image: 'http://cdn.osxdaily.com/wp-content/uploads/2013/06/OS-X-Mavericks-wallpaper.jpg',
        title: 'title',
        subtitle: 'subtitle',
        align: 'center', //center / left / right
        color : 'dark' // light / dark
      },
      roles: '*'
    };
    /*****************************
     * Nav Bar Top
    ****************************/
    // Navs.addNavItem('topbar', {
    //   title: _app.name,
    //   state: _app.state,
    //   type: 'dropdown',
    //   roles: _app.roles
    // });
    // Navs.addSubNavItem('topbar', 'articles', {
    //   title: 'List Articles',
    //   state: 'articles.list',
    //   roles: ['news']
    // });
    // Navs.addSubNavItem('topbar', 'articles', {
    //   title: 'Create Articles',
    //   state: 'articles.create',
    //   roles: ['news']
    // });
    /*****************************
     * Side Bar left
    ****************************/
    sideNavs.addSideNavItem('sidebar', {
      title: _app.name,
      icon: _app.icon,
      color: _app.color,
      fontColor: _app.fontColor,
      state: _app.state,
      view: _app.view,
      roles: _app.roles,
      position: _app.position
    });
    /*****************************
     * App store
    ****************************/
    appStore.addappStoreItem('appDiv', {
      title: _app.name,
      version: _app.version,
      state: _app.state,
      icon: _app.icon,
      color: _app.color,
      fontColor: _app.fontColor,
      tags: _app.tags,
      preview: _app.preview,
      excerpt: _app.excerpt,
      screenshots: _app.screenshots,
      description: _app.description,
      news: _app.news,
      roles: _app.roles
    });

  }
}());
