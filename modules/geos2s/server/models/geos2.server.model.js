'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Geos2 Schema
 */
var Geos2Schema = new Schema({
  name: {
    type: String,
    default: '',
    required: 'Please fill Geos2 name',
    trim: true
  },
  created: {
    type: Date,
    default: Date.now
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

mongoose.model('Geos2', Geos2Schema);
