'use strict';

/**
 * Module dependencies
 */
var passport = require('passport'),
  express = require('express'),
  focusPolicy = require('../policies/focus.server.policy'),
  focus = require('../controllers/focus.server.controller');

module.exports = function(app) {
  var router = express.Router();
  // get tier

  router.route('/mustCancers').all(focusPolicy.isAllowed)
  .get(focus.lungCancers, focus.stomachCancers, focus.colonCancers, focus.intestineCancers, focus.breastCancers,focus.mustCancers);

  router.route('/test').all(focusPolicy.isAllowed)
  .get(focus.test, focus.tree);

  // Finish by binding the Search middleware
  //router.param('idTier', search.getTierById);
  app.use('/api/focus', router);
};
