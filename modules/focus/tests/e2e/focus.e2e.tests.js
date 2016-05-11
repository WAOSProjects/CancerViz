'use strict';

describe('Focus E2E Tests:', function () {
  describe('Test Focus page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/focus');
      expect(element.all(by.repeater('focu in focus')).count()).toEqual(0);
    });
  });
});
