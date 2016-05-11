'use strict';

describe('Explores E2E Tests:', function () {
  describe('Test Explores page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/explores');
      expect(element.all(by.repeater('explore in explores')).count()).toEqual(0);
    });
  });
});
