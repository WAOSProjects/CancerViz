'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Geo = mongoose.model('Geo'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Geo
 */
exports.create = function(req, res) {
  var geo = new Geo(req.body);
  geo.user = req.user;

  geo.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(geo);
    }
  });
};

/**
 * Show the current Geo
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var geo = req.geo ? req.geo.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  geo.isCurrentUserOwner = req.user && geo.user && geo.user._id.toString() === req.user._id.toString() ? true : false;

  res.jsonp(geo);
};

/**
 * Update a Geo
 */
exports.update = function(req, res) {
  var geo = req.geo ;

  geo = _.extend(geo , req.body);

  geo.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(geo);
    }
  });
};

/**
 * Delete an Geo
 */
exports.delete = function(req, res) {
  var geo = req.geo ;

  geo.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(geo);
    }
  });
};

/**
 * List of Geos
 */
exports.list = function(req, res) { 
  Geo.find().sort('-created').populate('user', 'displayName').exec(function(err, geos) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(geos);
    }
  });
};

/**
 * Geo middleware
 */
exports.geoByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Geo is invalid'
    });
  }

  Geo.findById(id).populate('user', 'displayName').exec(function (err, geo) {
    if (err) {
      return next(err);
    } else if (!geo) {
      return res.status(404).send({
        message: 'No Geo with that identifier has been found'
      });
    }
    req.geo = geo;
    next();
  });
};
