'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Focu = mongoose.model('Focu'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app, agent, credentials, user, focu;

/**
 * Focu routes tests
 */
describe('Focu CRUD tests', function () {

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

    // Save a user to the test db and create new Focu
    user.save(function () {
      focu = {
        name: 'Focu name'
      };

      done();
    });
  });

  it('should be able to save a Focu if logged in', function (done) {
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

        // Save a new Focu
        agent.post('/api/focus')
          .send(focu)
          .expect(200)
          .end(function (focuSaveErr, focuSaveRes) {
            // Handle Focu save error
            if (focuSaveErr) {
              return done(focuSaveErr);
            }

            // Get a list of Focus
            agent.get('/api/focus')
              .end(function (focusGetErr, focusGetRes) {
                // Handle Focu save error
                if (focusGetErr) {
                  return done(focusGetErr);
                }

                // Get Focus list
                var focus = focusGetRes.body;

                // Set assertions
                (focus[0].user._id).should.equal(userId);
                (focus[0].name).should.match('Focu name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Focu if not logged in', function (done) {
    agent.post('/api/focus')
      .send(focu)
      .expect(403)
      .end(function (focuSaveErr, focuSaveRes) {
        // Call the assertion callback
        done(focuSaveErr);
      });
  });

  it('should not be able to save an Focu if no name is provided', function (done) {
    // Invalidate name field
    focu.name = '';

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

        // Save a new Focu
        agent.post('/api/focus')
          .send(focu)
          .expect(400)
          .end(function (focuSaveErr, focuSaveRes) {
            // Set message assertion
            (focuSaveRes.body.message).should.match('Please fill Focu name');

            // Handle Focu save error
            done(focuSaveErr);
          });
      });
  });

  it('should be able to update an Focu if signed in', function (done) {
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

        // Save a new Focu
        agent.post('/api/focus')
          .send(focu)
          .expect(200)
          .end(function (focuSaveErr, focuSaveRes) {
            // Handle Focu save error
            if (focuSaveErr) {
              return done(focuSaveErr);
            }

            // Update Focu name
            focu.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Focu
            agent.put('/api/focus/' + focuSaveRes.body._id)
              .send(focu)
              .expect(200)
              .end(function (focuUpdateErr, focuUpdateRes) {
                // Handle Focu update error
                if (focuUpdateErr) {
                  return done(focuUpdateErr);
                }

                // Set assertions
                (focuUpdateRes.body._id).should.equal(focuSaveRes.body._id);
                (focuUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Focus if not signed in', function (done) {
    // Create new Focu model instance
    var focuObj = new Focu(focu);

    // Save the focu
    focuObj.save(function () {
      // Request Focus
      request(app).get('/api/focus')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Focu if not signed in', function (done) {
    // Create new Focu model instance
    var focuObj = new Focu(focu);

    // Save the Focu
    focuObj.save(function () {
      request(app).get('/api/focus/' + focuObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', focu.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Focu with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/focus/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Focu is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Focu which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Focu
    request(app).get('/api/focus/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Focu with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Focu if signed in', function (done) {
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

        // Save a new Focu
        agent.post('/api/focus')
          .send(focu)
          .expect(200)
          .end(function (focuSaveErr, focuSaveRes) {
            // Handle Focu save error
            if (focuSaveErr) {
              return done(focuSaveErr);
            }

            // Delete an existing Focu
            agent.delete('/api/focus/' + focuSaveRes.body._id)
              .send(focu)
              .expect(200)
              .end(function (focuDeleteErr, focuDeleteRes) {
                // Handle focu error error
                if (focuDeleteErr) {
                  return done(focuDeleteErr);
                }

                // Set assertions
                (focuDeleteRes.body._id).should.equal(focuSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Focu if not signed in', function (done) {
    // Set Focu user
    focu.user = user;

    // Create new Focu model instance
    var focuObj = new Focu(focu);

    // Save the Focu
    focuObj.save(function () {
      // Try deleting Focu
      request(app).delete('/api/focus/' + focuObj._id)
        .expect(403)
        .end(function (focuDeleteErr, focuDeleteRes) {
          // Set message assertion
          (focuDeleteRes.body.message).should.match('User is not authorized');

          // Handle Focu error error
          done(focuDeleteErr);
        });

    });
  });

  it('should be able to get a single Focu that has an orphaned user reference', function (done) {
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

          // Save a new Focu
          agent.post('/api/focus')
            .send(focu)
            .expect(200)
            .end(function (focuSaveErr, focuSaveRes) {
              // Handle Focu save error
              if (focuSaveErr) {
                return done(focuSaveErr);
              }

              // Set assertions on new Focu
              (focuSaveRes.body.name).should.equal(focu.name);
              should.exist(focuSaveRes.body.user);
              should.equal(focuSaveRes.body.user._id, orphanId);

              // force the Focu to have an orphaned user reference
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

                    // Get the Focu
                    agent.get('/api/focus/' + focuSaveRes.body._id)
                      .expect(200)
                      .end(function (focuInfoErr, focuInfoRes) {
                        // Handle Focu error
                        if (focuInfoErr) {
                          return done(focuInfoErr);
                        }

                        // Set assertions
                        (focuInfoRes.body._id).should.equal(focuSaveRes.body._id);
                        (focuInfoRes.body.name).should.equal(focu.name);
                        should.equal(focuInfoRes.body.user, undefined);

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
      Focu.remove().exec(done);
    });
  });
});
