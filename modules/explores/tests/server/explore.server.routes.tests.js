'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Explore = mongoose.model('Explore'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app, agent, credentials, user, explore;

/**
 * Explore routes tests
 */
describe('Explore CRUD tests', function () {

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

    // Save a user to the test db and create new Explore
    user.save(function () {
      explore = {
        name: 'Explore name'
      };

      done();
    });
  });

  it('should be able to save a Explore if logged in', function (done) {
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

        // Save a new Explore
        agent.post('/api/explores')
          .send(explore)
          .expect(200)
          .end(function (exploreSaveErr, exploreSaveRes) {
            // Handle Explore save error
            if (exploreSaveErr) {
              return done(exploreSaveErr);
            }

            // Get a list of Explores
            agent.get('/api/explores')
              .end(function (exploresGetErr, exploresGetRes) {
                // Handle Explore save error
                if (exploresGetErr) {
                  return done(exploresGetErr);
                }

                // Get Explores list
                var explores = exploresGetRes.body;

                // Set assertions
                (explores[0].user._id).should.equal(userId);
                (explores[0].name).should.match('Explore name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Explore if not logged in', function (done) {
    agent.post('/api/explores')
      .send(explore)
      .expect(403)
      .end(function (exploreSaveErr, exploreSaveRes) {
        // Call the assertion callback
        done(exploreSaveErr);
      });
  });

  it('should not be able to save an Explore if no name is provided', function (done) {
    // Invalidate name field
    explore.name = '';

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

        // Save a new Explore
        agent.post('/api/explores')
          .send(explore)
          .expect(400)
          .end(function (exploreSaveErr, exploreSaveRes) {
            // Set message assertion
            (exploreSaveRes.body.message).should.match('Please fill Explore name');

            // Handle Explore save error
            done(exploreSaveErr);
          });
      });
  });

  it('should be able to update an Explore if signed in', function (done) {
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

        // Save a new Explore
        agent.post('/api/explores')
          .send(explore)
          .expect(200)
          .end(function (exploreSaveErr, exploreSaveRes) {
            // Handle Explore save error
            if (exploreSaveErr) {
              return done(exploreSaveErr);
            }

            // Update Explore name
            explore.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Explore
            agent.put('/api/explores/' + exploreSaveRes.body._id)
              .send(explore)
              .expect(200)
              .end(function (exploreUpdateErr, exploreUpdateRes) {
                // Handle Explore update error
                if (exploreUpdateErr) {
                  return done(exploreUpdateErr);
                }

                // Set assertions
                (exploreUpdateRes.body._id).should.equal(exploreSaveRes.body._id);
                (exploreUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Explores if not signed in', function (done) {
    // Create new Explore model instance
    var exploreObj = new Explore(explore);

    // Save the explore
    exploreObj.save(function () {
      // Request Explores
      request(app).get('/api/explores')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Explore if not signed in', function (done) {
    // Create new Explore model instance
    var exploreObj = new Explore(explore);

    // Save the Explore
    exploreObj.save(function () {
      request(app).get('/api/explores/' + exploreObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', explore.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Explore with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/explores/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Explore is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Explore which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Explore
    request(app).get('/api/explores/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Explore with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Explore if signed in', function (done) {
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

        // Save a new Explore
        agent.post('/api/explores')
          .send(explore)
          .expect(200)
          .end(function (exploreSaveErr, exploreSaveRes) {
            // Handle Explore save error
            if (exploreSaveErr) {
              return done(exploreSaveErr);
            }

            // Delete an existing Explore
            agent.delete('/api/explores/' + exploreSaveRes.body._id)
              .send(explore)
              .expect(200)
              .end(function (exploreDeleteErr, exploreDeleteRes) {
                // Handle explore error error
                if (exploreDeleteErr) {
                  return done(exploreDeleteErr);
                }

                // Set assertions
                (exploreDeleteRes.body._id).should.equal(exploreSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Explore if not signed in', function (done) {
    // Set Explore user
    explore.user = user;

    // Create new Explore model instance
    var exploreObj = new Explore(explore);

    // Save the Explore
    exploreObj.save(function () {
      // Try deleting Explore
      request(app).delete('/api/explores/' + exploreObj._id)
        .expect(403)
        .end(function (exploreDeleteErr, exploreDeleteRes) {
          // Set message assertion
          (exploreDeleteRes.body.message).should.match('User is not authorized');

          // Handle Explore error error
          done(exploreDeleteErr);
        });

    });
  });

  it('should be able to get a single Explore that has an orphaned user reference', function (done) {
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

          // Save a new Explore
          agent.post('/api/explores')
            .send(explore)
            .expect(200)
            .end(function (exploreSaveErr, exploreSaveRes) {
              // Handle Explore save error
              if (exploreSaveErr) {
                return done(exploreSaveErr);
              }

              // Set assertions on new Explore
              (exploreSaveRes.body.name).should.equal(explore.name);
              should.exist(exploreSaveRes.body.user);
              should.equal(exploreSaveRes.body.user._id, orphanId);

              // force the Explore to have an orphaned user reference
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

                    // Get the Explore
                    agent.get('/api/explores/' + exploreSaveRes.body._id)
                      .expect(200)
                      .end(function (exploreInfoErr, exploreInfoRes) {
                        // Handle Explore error
                        if (exploreInfoErr) {
                          return done(exploreInfoErr);
                        }

                        // Set assertions
                        (exploreInfoRes.body._id).should.equal(exploreSaveRes.body._id);
                        (exploreInfoRes.body.name).should.equal(explore.name);
                        should.equal(exploreInfoRes.body.user, undefined);

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
      Explore.remove().exec(done);
    });
  });
});
