'use strict';

describe('Geos E2E Tests:', function () {
  describe('Test Geos page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/geos');
      expect(element.all(by.repeater('geo in geos')).count()).toEqual(0);
    });
  });
});
