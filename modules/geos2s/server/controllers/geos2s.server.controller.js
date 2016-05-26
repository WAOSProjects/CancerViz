'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Geos2 = mongoose.model('Geos2'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Geos2
 */
exports.create = function(req, res) {
  var geos2 = new Geos2(req.body);
  geos2.user = req.user;

  geos2.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(geos2);
    }
  });
};

/**
 * Show the current Geos2
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var geos2 = req.geos2 ? req.geos2.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  geos2.isCurrentUserOwner = req.user && geos2.user && geos2.user._id.toString() === req.user._id.toString() ? true : false;

  res.jsonp(geos2);
};

/**
 * Update a Geos2
 */
exports.update = function(req, res) {
  var geos2 = req.geos2 ;

  geos2 = _.extend(geos2 , req.body);

  geos2.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(geos2);
    }
  });
};

/**
 * Delete an Geos2
 */
exports.delete = function(req, res) {
  var geos2 = req.geos2 ;

  geos2.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(geos2);
    }
  });
};

/**
 * List of Geos2s
 */
exports.list = function(req, res) { 
  Geos2.find().sort('-created').populate('user', 'displayName').exec(function(err, geos2s) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(geos2s);
    }
  });
};

/**
 * Geos2 middleware
 */
exports.geos2ByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Geos2 is invalid'
    });
  }

  Geos2.findById(id).populate('user', 'displayName').exec(function (err, geos2) {
    if (err) {
      return next(err);
    } else if (!geos2) {
      return res.status(404).send({
        message: 'No Geos2 with that identifier has been found'
      });
    }
    req.geos2 = geos2;
    next();
  });
};
