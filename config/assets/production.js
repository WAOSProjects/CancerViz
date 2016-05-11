'use strict';

module.exports = {
  client: {
    lib: {
      css: [
        // bower:css
        'public/lib/materialize/dist/css/materialize.min.css',
        'public/lib/font-awesome/css/font-awesome.min.css',
        'public/lib/angular-tooltips/dist/angular-tooltips.min.css',
        'public/lib/nvd3/build/nv.d3.css',
        'public/lib/dcjs/dc.min.css'
        // endbower
      ],
      js: [
        // bower:js
        'public/lib/jquery/dist/jquery.min.js',
        'public/lib/angular/angular.min.js',
        'public/lib/angular-resource/angular-resource.min.js',
        'public/lib/angular-animate/angular-animate.min.js',
        'public/lib/angular-messages/angular-messages.min.js',
        'public/lib/angular-sanitize/angular-sanitize.min.js',
        'public/lib/angular-ui-router/release/angular-ui-router.min.js',
        'public/lib/angular-bootstrap/ui-bootstrap-tpls.min.js',
        'public/lib/angular-file-upload/dist/angular-file-upload.min.js',
        'public/lib/owasp-password-strength-test/owasp-password-strength-test.js',
        'public/lib/materialize/dist/js/materialize.min.js',
        'public/lib/angular-materialize/src/angular-materialize.js',
        'public/lib/lodash/dist/lodash.min.js',
        'public/lib/d3/d3.min.js',
        'public/lib/nvd3/build/nv.d3.min.js',
        'public/lib/angular-nvd3/dist/angular-nvd3.js',
        'public/lib/crossfilter/crossfilter.min.js',
        'public/dc.2.min.js',
        'public/d3.geo.projection.min.js',
        'public/dvdf.js'
        // endbower
      ]
    },
    css: 'public/dist/application.min.css',
    js: 'public/dist/application.min.js'
  }
};
