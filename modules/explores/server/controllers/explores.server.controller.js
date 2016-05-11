'use strict';

/**
* Module dependencies.
*/
var path = require('path'),
  mongoose = require('mongoose'),
  Explore = mongoose.model('Explore'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
* yearDeath
*/
exports.deathsYears = function(req, res) {
  Explore.aggregate([{
    '$match': {
      'cancer': 'All cancers',
      'year': {
        '$lte': 2010
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
          'label': v._id.year,
          'value': v.dead
        };
      });

      res.jsonp([{
        key: 'Cumulative Return',
        values: _.orderBy(table, ['label'], ['asc'])
      }]);
    }
  });
};


exports.deathsCancers = function(req, res) {
  Explore.aggregate([{
    '$match': {
      'year': {
        '$lte': 2010
      }
    }
  }, {
    '$group': {
      '_id': {
        'cancer': '$cancer'
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
      results = _.map(results, function(v) {
        return {
          'label': v._id.cancer,
          'value': v.dead
        };
      });
      results = _.orderBy(results, ['value'], ['desc'])

      var allCancers = _.find(results, function(o) {
        return o.label === 'All cancers';
      });
      var allCancersButLung = _.find(results, function(o) {
        return o.label === 'All cancers but lung';
      });
      _.remove(results, function(o) {
        return o.label === 'All cancers';
      });
      _.remove(results, function(o) {
        return o.label === 'All cancers but lung';
      });

      res.jsonp([{
        allCancers: allCancers.value,
        allCancersButLung: allCancersButLung.value,
        key: 'Cumulative Return',
        values: results
      }]);
    }
  });
};


exports.risqsCancers = function(req, res) {
  Explore.aggregate([{
    '$match': {
      'year': {
        '$lte': 2010
      }
    }
  }, {
    '$group': {
      '_id': {
        'cancer': '$cancer'
      },
      'cumulative_risk': {
        '$sum': '$cumulative_risk'
      }
    }
  }]).exec(function(err, results) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      results = _.map(results, function(v) {
        return {
          'label': v._id.cancer,
          'value': v.cumulative_risk
        };
      });
      results = _.orderBy(results, ['value'], ['desc'])

      var allCancers = _.find(results, function(o) {
        return o.label === 'All cancers';
      });
      var allCancersButLung = _.find(results, function(o) {
        return o.label === 'All cancers but lung';
      });
      _.remove(results, function(o) {
        return o.label === 'All cancers';
      });
      _.remove(results, function(o) {
        return o.label === 'All cancers but lung';
      });

      res.jsonp([{
        allCancers: allCancers.value,
        allCancersButLung: allCancersButLung.value,
        key: 'Cumulative Return',
        values: results
      }]);
    }
  });
};
