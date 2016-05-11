'use strict';

/**
 * Module dependencies
 */
var geosPolicy = require('../policies/geos.server.policy'),
  geos = require('../controllers/geos.server.controller');

module.exports = function(app) {
  // Geos Routes
  app.route('/api/geos').all(geosPolicy.isAllowed)
    .get(geos.list)
    .post(geos.create);

  app.route('/api/geos/:geoId').all(geosPolicy.isAllowed)
    .get(geos.read)
    .put(geos.update)
    .delete(geos.delete);

  // Finish by binding the Geo middleware
  app.param('geoId', geos.geoByID);
};
