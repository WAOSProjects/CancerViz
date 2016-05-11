(function () {
  'use strict';

  angular
    .module('core')
    .factory('appStore', appStore);

  function appStore() {
    var shouldRender;
    var service = {
      addappStore: addappStore,
      addappStoreItem: addappStoreItem,
      addSubappStoreItem: addSubappStoreItem,
      defaultRoles: ['user', 'admin'],
      getappStore: getappStore,
      appStores: {},
      removeappStore: removeappStore,
      removeappStoreItem: removeappStoreItem,
      removeSubappStoreItem: removeSubappStoreItem,
      validateappStoreExistance: validateappStoreExistance
    };

    init();

    return service;

    // Add new appStore object by appStore id
    function addappStore(appStoreId, options) {
      options = options || {};

      // Create the new appStore
      service.appStores[appStoreId] = {
        roles: options.roles || service.defaultRoles,
        items: options.items || [],
        shouldRender: shouldRender
      };

      // Return the appStore object
      return service.appStores[appStoreId];
    }

    // Add appStore item object
    function addappStoreItem(appStoreId, options) {
      options = options || {};

      // Validate that the appStore exists
      service.validateappStoreExistance(appStoreId);

      // Push new appStore item
      service.appStores[appStoreId].items.push({
        title: options.title || '',
        version: options.version || '',
        state: options.state || '',
        icon: options.icon,
        color: options.color,
        fontColor: options.fontColor || '',
        tags: options.tags,
        preview: options.preview,
        excerpt: options.excerpt,
        screenshots: options.screenshots,
        news: options.news,
        description: options.description,
        type: options.type || 'item',
        class: options.class,
        roles: ((options.roles === null || typeof options.roles === 'undefined') ? service.defaultRoles : options.roles),
        position: options.position || 0,
        items: [],
        shouldRender: shouldRender
      });

      // Add subappStore items
      if (options.items) {
        for (var i in options.items) {
          if (options.items.hasOwnProperty(i)) {
            service.addSubappStoreItem(appStoreId, options.state, options.items[i]);
          }
        }
      }

      // Return the appStore object
      return service.appStores[appStoreId];
    }

    // Add subappStore item object
    function addSubappStoreItem(appStoreId, parentItemState, options) {
      options = options || {};

      // Validate that the appStore exists
      service.validateappStoreExistance(appStoreId);

      // Search for appStore item
      for (var itemIndex in service.appStores[appStoreId].items) {
        if (service.appStores[appStoreId].items[itemIndex].state === parentItemState) {
          // Push new subappStore item
          service.appStores[appStoreId].items[itemIndex].items.push({
            title: options.title || '',
            version: options.version || '',
            state: options.state || '',
            icon: options.icon,
            color: options.color,
            fontColor: options.fontColor || '',
            tags: options.tags,
            preview: options.preview,
            excerpt: options.excerpt,
            screenshots: options.screenshots,
            news: options.news,
            description: options.description,
            type: options.type || 'item',
            class: options.class,
            roles: ((options.roles === null || typeof options.roles === 'undefined') ? service.appStores[appStoreId].items[itemIndex].roles : options.roles),
            position: options.position || 0,
            shouldRender: shouldRender
          });
        }
      }

      // Return the appStore object
      return service.appStores[appStoreId];
    }

    // Get the appStore object by appStore id
    function getappStore(appStoreId) {
      // Validate that the appStore exists
      service.validateappStoreExistance(appStoreId);

      // Return the appStore object
      return service.appStores[appStoreId];
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

      // Adding the topbar appStore
      addappStore('appDiv', {
        roles: ['*']
      });
    }

    // Remove existing appStore object by appStore id
    function removeappStore(appStoreId) {
      // Validate that the appStore exists
      service.validateappStoreExistance(appStoreId);

      delete service.appStores[appStoreId];
    }

    // Remove existing appStore object by appStore id
    function removeappStoreItem(appStoreId, appStoreItemState) {
      // Validate that the appStore exists
      service.validateappStoreExistance(appStoreId);

      // Search for appStore item to remove
      for (var itemIndex in service.appStores[appStoreId].items) {
        if (service.appStores[appStoreId].items.hasOwnProperty(itemIndex) && service.appStores[appStoreId].items[itemIndex].state === appStoreItemState) {
          service.appStores[appStoreId].items.splice(itemIndex, 1);
        }
      }

      // Return the appStore object
      return service.appStores[appStoreId];
    }

    // Remove existing appStore object by appStore id
    function removeSubappStoreItem(appStoreId, subappStoreItemState) {
      // Validate that the appStore exists
      service.validateappStoreExistance(appStoreId);

      // Search for appStore item to remove
      for (var itemIndex in service.appStores[appStoreId].items) {
        if (this.appStores[appStoreId].items.hasOwnProperty(itemIndex)) {
          for (var subitemIndex in service.appStores[appStoreId].items[itemIndex].items) {
            if (this.appStores[appStoreId].items[itemIndex].items.hasOwnProperty(subitemIndex) && service.appStores[appStoreId].items[itemIndex].items[subitemIndex].state === subappStoreItemState) {
              service.appStores[appStoreId].items[itemIndex].items.splice(subitemIndex, 1);
            }
          }
        }
      }

      // Return the appStore object
      return service.appStores[appStoreId];
    }

    // Validate appStore existance
    function validateappStoreExistance(appStoreId) {
      if (appStoreId && appStoreId.length) {
        if (service.appStores[appStoreId]) {
          return true;
        } else {
          throw new Error('appStore does not exist');
        }
      } else {
        throw new Error('appStoreId was not provided');
      }
    }
  }
}());
