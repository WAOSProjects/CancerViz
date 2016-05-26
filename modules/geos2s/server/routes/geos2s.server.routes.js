'use strict';

/**
 * Module dependencies
 */
var geos2sPolicy = require('../policies/geos2s.server.policy'),
  geos2s = require('../controllers/geos2s.server.controller');

module.exports = function(app) {
  // Geos2s Routes
  app.route('/api/geos2s').all(geos2sPolicy.isAllowed)
    .get(geos2s.list)
    .post(geos2s.create);

  app.route('/api/geos2s/:geos2Id').all(geos2sPolicy.isAllowed)
    .get(geos2s.read)
    .put(geos2s.update)
    .delete(geos2s.delete);

  // Finish by binding the Geos2 middleware
  app.param('geos2Id', geos2s.geos2ByID);
};
