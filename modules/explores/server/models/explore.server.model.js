'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Explore Schema
 */
var ExploreSchema = new Schema({
  name: {
    type: String,
    default: '',
    required: 'Please fill Explore name',
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

mongoose.model('Explore', ExploreSchema);
