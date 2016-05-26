'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Geos2 = mongoose.model('Geos2'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app, agent, credentials, user, geos2;

/**
 * Geos2 routes tests
 */
describe('Geos2 CRUD tests', function () {

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

    // Save a user to the test db and create new Geos2
    user.save(function () {
      geos2 = {
        name: 'Geos2 name'
      };

      done();
    });
  });

  it('should be able to save a Geos2 if logged in', function (done) {
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

        // Save a new Geos2
        agent.post('/api/geos2s')
          .send(geos2)
          .expect(200)
          .end(function (geos2SaveErr, geos2SaveRes) {
            // Handle Geos2 save error
            if (geos2SaveErr) {
              return done(geos2SaveErr);
            }

            // Get a list of Geos2s
            agent.get('/api/geos2s')
              .end(function (geos2sGetErr, geos2sGetRes) {
                // Handle Geos2 save error
                if (geos2sGetErr) {
                  return done(geos2sGetErr);
                }

                // Get Geos2s list
                var geos2s = geos2sGetRes.body;

                // Set assertions
                (geos2s[0].user._id).should.equal(userId);
                (geos2s[0].name).should.match('Geos2 name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Geos2 if not logged in', function (done) {
    agent.post('/api/geos2s')
      .send(geos2)
      .expect(403)
      .end(function (geos2SaveErr, geos2SaveRes) {
        // Call the assertion callback
        done(geos2SaveErr);
      });
  });

  it('should not be able to save an Geos2 if no name is provided', function (done) {
    // Invalidate name field
    geos2.name = '';

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

        // Save a new Geos2
        agent.post('/api/geos2s')
          .send(geos2)
          .expect(400)
          .end(function (geos2SaveErr, geos2SaveRes) {
            // Set message assertion
            (geos2SaveRes.body.message).should.match('Please fill Geos2 name');

            // Handle Geos2 save error
            done(geos2SaveErr);
          });
      });
  });

  it('should be able to update an Geos2 if signed in', function (done) {
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

        // Save a new Geos2
        agent.post('/api/geos2s')
          .send(geos2)
          .expect(200)
          .end(function (geos2SaveErr, geos2SaveRes) {
            // Handle Geos2 save error
            if (geos2SaveErr) {
              return done(geos2SaveErr);
            }

            // Update Geos2 name
            geos2.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Geos2
            agent.put('/api/geos2s/' + geos2SaveRes.body._id)
              .send(geos2)
              .expect(200)
              .end(function (geos2UpdateErr, geos2UpdateRes) {
                // Handle Geos2 update error
                if (geos2UpdateErr) {
                  return done(geos2UpdateErr);
                }

                // Set assertions
                (geos2UpdateRes.body._id).should.equal(geos2SaveRes.body._id);
                (geos2UpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Geos2s if not signed in', function (done) {
    // Create new Geos2 model instance
    var geos2Obj = new Geos2(geos2);

    // Save the geos2
    geos2Obj.save(function () {
      // Request Geos2s
      request(app).get('/api/geos2s')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Geos2 if not signed in', function (done) {
    // Create new Geos2 model instance
    var geos2Obj = new Geos2(geos2);

    // Save the Geos2
    geos2Obj.save(function () {
      request(app).get('/api/geos2s/' + geos2Obj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', geos2.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Geos2 with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/geos2s/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Geos2 is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Geos2 which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Geos2
    request(app).get('/api/geos2s/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Geos2 with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Geos2 if signed in', function (done) {
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

        // Save a new Geos2
        agent.post('/api/geos2s')
          .send(geos2)
          .expect(200)
          .end(function (geos2SaveErr, geos2SaveRes) {
            // Handle Geos2 save error
            if (geos2SaveErr) {
              return done(geos2SaveErr);
            }

            // Delete an existing Geos2
            agent.delete('/api/geos2s/' + geos2SaveRes.body._id)
              .send(geos2)
              .expect(200)
              .end(function (geos2DeleteErr, geos2DeleteRes) {
                // Handle geos2 error error
                if (geos2DeleteErr) {
                  return done(geos2DeleteErr);
                }

                // Set assertions
                (geos2DeleteRes.body._id).should.equal(geos2SaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Geos2 if not signed in', function (done) {
    // Set Geos2 user
    geos2.user = user;

    // Create new Geos2 model instance
    var geos2Obj = new Geos2(geos2);

    // Save the Geos2
    geos2Obj.save(function () {
      // Try deleting Geos2
      request(app).delete('/api/geos2s/' + geos2Obj._id)
        .expect(403)
        .end(function (geos2DeleteErr, geos2DeleteRes) {
          // Set message assertion
          (geos2DeleteRes.body.message).should.match('User is not authorized');

          // Handle Geos2 error error
          done(geos2DeleteErr);
        });

    });
  });

  it('should be able to get a single Geos2 that has an orphaned user reference', function (done) {
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

          // Save a new Geos2
          agent.post('/api/geos2s')
            .send(geos2)
            .expect(200)
            .end(function (geos2SaveErr, geos2SaveRes) {
              // Handle Geos2 save error
              if (geos2SaveErr) {
                return done(geos2SaveErr);
              }

              // Set assertions on new Geos2
              (geos2SaveRes.body.name).should.equal(geos2.name);
              should.exist(geos2SaveRes.body.user);
              should.equal(geos2SaveRes.body.user._id, orphanId);

              // force the Geos2 to have an orphaned user reference
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

                    // Get the Geos2
                    agent.get('/api/geos2s/' + geos2SaveRes.body._id)
                      .expect(200)
                      .end(function (geos2InfoErr, geos2InfoRes) {
                        // Handle Geos2 error
                        if (geos2InfoErr) {
                          return done(geos2InfoErr);
                        }

                        // Set assertions
                        (geos2InfoRes.body._id).should.equal(geos2SaveRes.body._id);
                        (geos2InfoRes.body.name).should.equal(geos2.name);
                        should.equal(geos2InfoRes.body.user, undefined);

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
      Geos2.remove().exec(done);
    });
  });
});
