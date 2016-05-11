'use strict';

/**
* Module dependencies
*/
var passport = require('passport'),
  express = require('express'),
  exploresPolicy = require('../policies/explores.server.policy'),
  explores = require('../controllers/explores.server.controller');

module.exports = function(app) {
  var router = express.Router();
  // get tier
  router.route('/deathsYears').all(exploresPolicy.isAllowed)
  .get(explores.deathsYears);
  router.route('/deathsCancers').all(exploresPolicy.isAllowed)
  .get(explores.deathsCancers);
  router.route('/risqsCancers').all(exploresPolicy.isAllowed)
  .get(explores.risqsCancers);
  // Finish by binding the Search middleware
  //router.param('idTier', search.getTierById);
  app.use('/api/explores', router);
};
