'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Geo Schema
 */
var GeoSchema = new Schema({
  name: {
    type: String,
    default: '',
    required: 'Please fill Geo name',
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

mongoose.model('Geo', GeoSchema);
