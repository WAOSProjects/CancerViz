'use strict';

module.exports = {
  client: {
    lib: {
      css: [
        // bower:css
        'public/lib/materialize/dist/css/materialize.css',
        'public/lib/font-awesome/css/font-awesome.min.css',
        'public/lib/angular-tooltips/dist/angular-tooltips.css',
        'public/lib/nvd3/build/nv.d3.css',
        'public/lib/dcjs/dc.min.css'
        // endbower
      ],
      js: [
        // bower:js
        'public/lib/jquery/dist/jquery.min.js',
        'public/lib/angular/angular.js',
        'public/lib/angular-resource/angular-resource.js',
        'public/lib/angular-animate/angular-animate.js',
        'public/lib/angular-messages/angular-messages.js',
        'public/lib/angular-sanitize/angular-sanitize.js',
        'public/lib/angular-ui-router/release/angular-ui-router.js',
        'public/lib/angular-bootstrap/ui-bootstrap-tpls.js',
        'public/lib/angular-file-upload/dist/angular-file-upload.js',
        'public/lib/owasp-password-strength-test/owasp-password-strength-test.js',
        'public/lib/materialize/dist/js/materialize.min.js',
        'public/lib/angular-materialize/src/angular-materialize.js',
        'public/lib/lodash/dist/lodash.js',
        'public/lib/d3/d3.js',
        'public/lib/nvd3/build/nv.d3.js',
        'public/lib/angular-nvd3/dist/angular-nvd3.js',
        'public/lib/crossfilter/crossfilter.min.js',
        'public/dc.2.min.js',
        'public/d3.geo.projection.min.js',
        'public/dvdf-0.0.3a.js',
        'public/dvdf.js',
        'public/d3-queue.v2.js',
        'public/colorbrewer.min.js'
        // endbower
      ],
      tests: ['public/lib/angular-mocks/angular-mocks.js']
    },
    css: [
      'modules/*/client/css/*.css'
    ],
    less: [
      'modules/*/client/less/*.less'
    ],
    sass: [
      'modules/*/client/scss/*.scss'
    ],
    js: [
      'modules/core/client/app/config.js',
      'modules/core/client/app/init.js',
      'modules/*/client/*.js',
      'modules/*/client/**/*.js'
    ],
    img: [
      'modules/**/*/img/**/*.jpg',
      'modules/**/*/img/**/*.png',
      'modules/**/*/img/**/*.gif',
      'modules/**/*/img/**/*.svg'
    ],
    views: ['modules/*/client/views/**/*.html'],
    templates: ['build/templates.js']
  },
  server: {
    gruntConfig: ['gruntfile.js'],
    gulpConfig: ['gulpfile.js'],
    allJS: ['server.js', 'config/**/*.js', 'modules/*/server/**/*.js'],
    models: 'modules/*/server/models/**/*.js',
    routes: ['modules/!(core)/server/routes/**/*.js', 'modules/core/server/routes/**/*.js'],
    sockets: 'modules/*/server/sockets/**/*.js',
    config: ['modules/*/server/config/*.js'],
    policies: 'modules/*/server/policies/*.js',
    views: ['modules/*/server/views/*.html']
  }
};
