'use strict';

/**
 * Module dependencies
 */
var acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Geos2s Permissions
 */
exports.invokeRolesPolicies = function () {
  acl.allow([{
    roles: ['admin'],
    allows: [{
      resources: '/api/geos2s',
      permissions: '*'
    }, {
      resources: '/api/geos2s/:geos2Id',
      permissions: '*'
    }]
  }, {
    roles: ['user'],
    allows: [{
      resources: '/api/geos2s',
      permissions: ['get', 'post']
    }, {
      resources: '/api/geos2s/:geos2Id',
      permissions: ['get']
    }]
  }, {
    roles: ['guest'],
    allows: [{
      resources: '/api/geos2s',
      permissions: ['get']
    }, {
      resources: '/api/geos2s/:geos2Id',
      permissions: ['get']
    }]
  }]);
};

/**
 * Check If Geos2s Policy Allows
 */
exports.isAllowed = function (req, res, next) {
  var roles = (req.user) ? req.user.roles : ['guest'];

  // If an Geos2 is being processed and the current user created it then allow any manipulation
  if (req.geos2 && req.user && req.geos2.user && req.geos2.user.id === req.user.id) {
    return next();
  }

  // Check for user roles
  acl.areAnyRolesAllowed(roles, req.route.path, req.method.toLowerCase(), function (err, isAllowed) {
    if (err) {
      // An authorization error occurred
      return res.status(500).send('Unexpected authorization error');
    } else {
      if (isAllowed) {
        // Access granted! Invoke next middleware
        return next();
      } else {
        return res.status(403).json({
          message: 'User is not authorized'
        });
      }
    }
  });
};
