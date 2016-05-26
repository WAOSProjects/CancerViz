'use strict';

describe('Geos2s E2E Tests:', function () {
  describe('Test Geos2s page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/geos2s');
      expect(element.all(by.repeater('geos2 in geos2s')).count()).toEqual(0);
    });
  });
});
