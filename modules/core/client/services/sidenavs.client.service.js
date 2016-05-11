(function () {
  'use strict';

  angular
    .module('core')
    .factory('sideNavs', sideNavs);

  function sideNavs() {
    var shouldRender;
    var service = {
      addSideNav: addSideNav,
      addSideNavItem: addSideNavItem,
      addSubSideNavItem: addSubSideNavItem,
      defaultRoles: ['user', 'admin'],
      getSideNav: getSideNav,
      sideNavs: {},
      removeSideNav: removeSideNav,
      removeSideNavItem: removeSideNavItem,
      removeSubSideNavItem: removeSubSideNavItem,
      validateSideNavExistance: validateSideNavExistance
    };

    init();

    return service;

    // Add new sideNav object by sideNav id
    function addSideNav(sideNavId, options) {
      options = options || {};

      // Create the new sideNav
      service.sideNavs[sideNavId] = {
        roles: options.roles || service.defaultRoles,
        items: options.items || [],
        shouldRender: shouldRender
      };

      // Return the sideNav object
      return service.sideNavs[sideNavId];
    }

    // Add sideNav item object
    function addSideNavItem(sideNavId, options) {
      options = options || {};

      // Validate that the sideNav exists
      service.validateSideNavExistance(sideNavId);

      // Push new sideNav item
      service.sideNavs[sideNavId].items.push({
        title: options.title || '',
        state: options.state || '',
        view: options.view || '',
        icon: options.icon || '',
        color: options.color || '',
        fontColor: options.fontColor || '',
        type: options.type || 'item',
        class: options.class,
        roles: ((options.roles === null || typeof options.roles === 'undefined') ? service.defaultRoles : options.roles),
        position: options.position || 0,
        items: [],
        shouldRender: shouldRender
      });

      // Add subsideNav items
      if (options.items) {
        for (var i in options.items) {
          if (options.items.hasOwnProperty(i)) {
            service.addSubSideNavItem(sideNavId, options.state, options.items[i]);
          }
        }
      }

      // Return the sideNav object
      return service.sideNavs[sideNavId];
    }

    // Add subsideNav item object
    function addSubSideNavItem(sideNavId, parentItemState, options) {
      options = options || {};

      // Validate that the sideNav exists
      service.validateSideNavExistance(sideNavId);

      // Search for sideNav item
      for (var itemIndex in service.sideNavs[sideNavId].items) {
        if (service.sideNavs[sideNavId].items[itemIndex].state === parentItemState) {
          // Push new subsideNav item
          service.sideNavs[sideNavId].items[itemIndex].items.push({
            title: options.title || '',
            view: options.view || '',
            icon: options.icon || '',
            color: options.color || '',
            fontColor: options.fontColor || '',
            state: options.state || '',
            roles: ((options.roles === null || typeof options.roles === 'undefined') ? service.sideNavs[sideNavId].items[itemIndex].roles : options.roles),
            position: options.position || 0,
            shouldRender: shouldRender
          });
        }
      }

      // Return the sideNav object
      return service.sideNavs[sideNavId];
    }

    // Get the sideNav object by sideNav id
    function getSideNav(sideNavId) {
      // Validate that the sideNav exists
      service.validateSideNavExistance(sideNavId);

      // Return the sideNav object
      return service.sideNavs[sideNavId];
    }

    function init() {
      // A private function for rendering decision
      shouldRender = function (user) {
        if (this.roles.indexOf('*') !== -1) {
          return true;
        } else {
          if (!user) {
            return false;
          }

          for (var userRoleIndex in user.roles) {
            if (user.roles.hasOwnProperty(userRoleIndex)) {
              for (var roleIndex in this.roles) {
                if (this.roles.hasOwnProperty(roleIndex) && this.roles[roleIndex] === user.roles[userRoleIndex]) {
                  return true;
                }
              }
            }
          }
        }

        return false;
      };

      // Adding the topbar sideNav
      addSideNav('sidebar', {
        roles: ['*']
      });
    }

    // Remove existing sideNav object by sideNav id
    function removeSideNav(sideNavId) {
      // Validate that the sideNav exists
      service.validateSideNavExistance(sideNavId);

      delete service.sideNavs[sideNavId];
    }

    // Remove existing sideNav object by sideNav id
    function removeSideNavItem(sideNavId, sideNavItemState) {
      // Validate that the sideNav exists
      service.validateSideNavExistance(sideNavId);

      // Search for sideNav item to remove
      for (var itemIndex in service.sideNavs[sideNavId].items) {
        if (service.sideNavs[sideNavId].items.hasOwnProperty(itemIndex) && service.sideNavs[sideNavId].items[itemIndex].state === sideNavItemState) {
          service.sideNavs[sideNavId].items.splice(itemIndex, 1);
        }
      }

      // Return the sideNav object
      return service.sideNavs[sideNavId];
    }

    // Remove existing sideNav object by sideNav id
    function removeSubSideNavItem(sideNavId, subsideNavItemState) {
      // Validate that the sideNav exists
      service.validateSideNavExistance(sideNavId);

      // Search for sideNav item to remove
      for (var itemIndex in service.sideNavs[sideNavId].items) {
        if (this.sideNavs[sideNavId].items.hasOwnProperty(itemIndex)) {
          for (var subitemIndex in service.sideNavs[sideNavId].items[itemIndex].items) {
            if (this.sideNavs[sideNavId].items[itemIndex].items.hasOwnProperty(subitemIndex) && service.sideNavs[sideNavId].items[itemIndex].items[subitemIndex].state === subsideNavItemState) {
              service.sideNavs[sideNavId].items[itemIndex].items.splice(subitemIndex, 1);
            }
          }
        }
      }

      // Return the sideNav object
      return service.sideNavs[sideNavId];
    }

    // Validate sideNav existance
    function validateSideNavExistance(sideNavId) {
      if (sideNavId && sideNavId.length) {
        if (service.sideNavs[sideNavId]) {
          return true;
        } else {
          throw new Error('SideNav does not exist');
        }
      } else {
        throw new Error('SideNavId was not provided');
      }
    }
  }
}());
