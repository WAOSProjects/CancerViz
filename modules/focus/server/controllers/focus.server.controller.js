'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
    mongoose = require('mongoose'),
    Explore = mongoose.model('Explore'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    _ = require('lodash');



exports.mustCancers = function(req, res) {
  if (!req.lung || !req.stomach) {
    return res.status(400).send({
      message: 'Failed to create Graph'
    });
  }
  res.json([req.lung, req.stomach, req.colon, req.intestine, req.breast]);
};

/**
 * middleware
 */

exports.lungCancers = function(req, res, next) {
  console.log('test');
  Explore.aggregate([{
    '$match': {
      'cancer': 'Lung',
      'year': {
        '$lte': 2010,
        '$gte': 1990
      }
    }
  }, {
    '$group': {
      '_id': {
        'year': '$year'
      },
      'dead': {
        '$sum': '$deaths'
      }
    }
  }]).exec(function(err, results) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      var table = _.map(results, function(v) {
        return {
          'x': v._id.year,
          'y': v.dead
        };
      });
      req.lung = {
        'key': 'Lung',
        'values': _.orderBy(table, ['x'], ['asc'])
      };
      next();
    }
  });
};

exports.stomachCancers = function(req, res, next) {
  Explore.aggregate([{
    '$match': {
      'cancer': 'Stomach',
      'year': {
        '$lte': 2010,
        '$gte': 1990
      }
    }
  }, {
    '$group': {
      '_id': {
        'year': '$year'
      },
      'dead': {
        '$sum': '$deaths'
      }
    }
  }]).exec(function(err, results) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      var table = _.map(results, function(v) {
        return {
          'x': v._id.year,
          'y': v.dead
        };
      });
      req.stomach = {
        'key': 'Stomach',
        'values': _.orderBy(table, ['x'], ['asc'])
      };
      next();
    }
  });
};

exports.colonCancers = function(req, res, next) {
  Explore.aggregate([{
    '$match': {
      'cancer': 'Colon - rectum and anus',
      'year': {
        '$lte': 2010,
        '$gte': 1990
      }
    }
  }, {
    '$group': {
      '_id': {
        'year': '$year'
      },
      'dead': {
        '$sum': '$deaths'
      }
    }
  }]).exec(function(err, results) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      var table = _.map(results, function(v) {
        return {
          'x': v._id.year,
          'y': v.dead
        };
      });
      req.colon = {
        'key': 'Colon - rectum and anus',
        'values': _.orderBy(table, ['x'], ['asc'])
      };
      next();
    }
  });
};

exports.intestineCancers = function(req, res, next) {
  Explore.aggregate([{
    '$match': {
      'cancer': 'Intestine',
      'year': {
        '$lte': 2010,
        '$gte': 1990
      }
    }
  }, {
    '$group': {
      '_id': {
        'year': '$year'
      },
      'dead': {
        '$sum': '$deaths'
      }
    }
  }]).exec(function(err, results) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      var table = _.map(results, function(v) {
        return {
          'x': v._id.year,
          'y': v.dead
        };
      });
      req.intestine = {
        'key': 'intestine',
        'values': _.orderBy(table, ['x'], ['asc'])
      };
      next();
    }
  });
};

exports.breastCancers = function(req, res, next) {
  Explore.aggregate([{
    '$match': {
      'cancer': 'Breast',
      'year': {
        '$lte': 2010,
        '$gte': 1990
      }
    }
  }, {
    '$group': {
      '_id': {
        'year': '$year'
      },
      'dead': {
        '$sum': '$deaths'
      }
    }
  }]).exec(function(err, results) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      var table = _.map(results, function(v) {
        return {
          'x': v._id.year,
          'y': v.dead
        };
      });
      req.breast = {
        'key': 'Breast',
        'values': _.orderBy(table, ['x'], ['asc'])
      };
      next();
    }
  });
};
