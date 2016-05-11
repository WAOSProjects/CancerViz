'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Geo = mongoose.model('Geo'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app, agent, credentials, user, geo;

/**
 * Geo routes tests
 */
describe('Geo CRUD tests', function () {

  before(function (done) {
    // Get application
    app = express.init(mongoose);
    agent = request.agent(app);

    done();
  });

  beforeEach(function (done) {
    // Create user credentials
    credentials = {
      username: 'username',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create a new user
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: credentials.username,
      password: credentials.password,
      provider: 'local'
    });

    // Save a user to the test db and create new Geo
    user.save(function () {
      geo = {
        name: 'Geo name'
      };

      done();
    });
  });

  it('should be able to save a Geo if logged in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Geo
        agent.post('/api/geos')
          .send(geo)
          .expect(200)
          .end(function (geoSaveErr, geoSaveRes) {
            // Handle Geo save error
            if (geoSaveErr) {
              return done(geoSaveErr);
            }

            // Get a list of Geos
            agent.get('/api/geos')
              .end(function (geosGetErr, geosGetRes) {
                // Handle Geo save error
                if (geosGetErr) {
                  return done(geosGetErr);
                }

                // Get Geos list
                var geos = geosGetRes.body;

                // Set assertions
                (geos[0].user._id).should.equal(userId);
                (geos[0].name).should.match('Geo name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Geo if not logged in', function (done) {
    agent.post('/api/geos')
      .send(geo)
      .expect(403)
      .end(function (geoSaveErr, geoSaveRes) {
        // Call the assertion callback
        done(geoSaveErr);
      });
  });

  it('should not be able to save an Geo if no name is provided', function (done) {
    // Invalidate name field
    geo.name = '';

    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Geo
        agent.post('/api/geos')
          .send(geo)
          .expect(400)
          .end(function (geoSaveErr, geoSaveRes) {
            // Set message assertion
            (geoSaveRes.body.message).should.match('Please fill Geo name');

            // Handle Geo save error
            done(geoSaveErr);
          });
      });
  });

  it('should be able to update an Geo if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Geo
        agent.post('/api/geos')
          .send(geo)
          .expect(200)
          .end(function (geoSaveErr, geoSaveRes) {
            // Handle Geo save error
            if (geoSaveErr) {
              return done(geoSaveErr);
            }

            // Update Geo name
            geo.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Geo
            agent.put('/api/geos/' + geoSaveRes.body._id)
              .send(geo)
              .expect(200)
              .end(function (geoUpdateErr, geoUpdateRes) {
                // Handle Geo update error
                if (geoUpdateErr) {
                  return done(geoUpdateErr);
                }

                // Set assertions
                (geoUpdateRes.body._id).should.equal(geoSaveRes.body._id);
                (geoUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Geos if not signed in', function (done) {
    // Create new Geo model instance
    var geoObj = new Geo(geo);

    // Save the geo
    geoObj.save(function () {
      // Request Geos
      request(app).get('/api/geos')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Geo if not signed in', function (done) {
    // Create new Geo model instance
    var geoObj = new Geo(geo);

    // Save the Geo
    geoObj.save(function () {
      request(app).get('/api/geos/' + geoObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', geo.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Geo with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/geos/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Geo is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Geo which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Geo
    request(app).get('/api/geos/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Geo with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Geo if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Geo
        agent.post('/api/geos')
          .send(geo)
          .expect(200)
          .end(function (geoSaveErr, geoSaveRes) {
            // Handle Geo save error
            if (geoSaveErr) {
              return done(geoSaveErr);
            }

            // Delete an existing Geo
            agent.delete('/api/geos/' + geoSaveRes.body._id)
              .send(geo)
              .expect(200)
              .end(function (geoDeleteErr, geoDeleteRes) {
                // Handle geo error error
                if (geoDeleteErr) {
                  return done(geoDeleteErr);
                }

                // Set assertions
                (geoDeleteRes.body._id).should.equal(geoSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Geo if not signed in', function (done) {
    // Set Geo user
    geo.user = user;

    // Create new Geo model instance
    var geoObj = new Geo(geo);

    // Save the Geo
    geoObj.save(function () {
      // Try deleting Geo
      request(app).delete('/api/geos/' + geoObj._id)
        .expect(403)
        .end(function (geoDeleteErr, geoDeleteRes) {
          // Set message assertion
          (geoDeleteRes.body.message).should.match('User is not authorized');

          // Handle Geo error error
          done(geoDeleteErr);
        });

    });
  });

  it('should be able to get a single Geo that has an orphaned user reference', function (done) {
    // Create orphan user creds
    var _creds = {
      username: 'orphan',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create orphan user
    var _orphan = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'orphan@test.com',
      username: _creds.username,
      password: _creds.password,
      provider: 'local'
    });

    _orphan.save(function (err, orphan) {
      // Handle save error
      if (err) {
        return done(err);
      }

      agent.post('/api/auth/signin')
        .send(_creds)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }

          // Get the userId
          var orphanId = orphan._id;

          // Save a new Geo
          agent.post('/api/geos')
            .send(geo)
            .expect(200)
            .end(function (geoSaveErr, geoSaveRes) {
              // Handle Geo save error
              if (geoSaveErr) {
                return done(geoSaveErr);
              }

              // Set assertions on new Geo
              (geoSaveRes.body.name).should.equal(geo.name);
              should.exist(geoSaveRes.body.user);
              should.equal(geoSaveRes.body.user._id, orphanId);

              // force the Geo to have an orphaned user reference
              orphan.remove(function () {
                // now signin with valid user
                agent.post('/api/auth/signin')
                  .send(credentials)
                  .expect(200)
                  .end(function (err, res) {
                    // Handle signin error
                    if (err) {
                      return done(err);
                    }

                    // Get the Geo
                    agent.get('/api/geos/' + geoSaveRes.body._id)
                      .expect(200)
                      .end(function (geoInfoErr, geoInfoRes) {
                        // Handle Geo error
                        if (geoInfoErr) {
                          return done(geoInfoErr);
                        }

                        // Set assertions
                        (geoInfoRes.body._id).should.equal(geoSaveRes.body._id);
                        (geoInfoRes.body.name).should.equal(geo.name);
                        should.equal(geoInfoRes.body.user, undefined);

                        // Call the assertion callback
                        done();
                      });
                  });
              });
            });
        });
    });
  });

  afterEach(function (done) {
    User.remove().exec(function () {
      Geo.remove().exec(done);
    });
  });
});
