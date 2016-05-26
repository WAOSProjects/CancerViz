(function () {
  'use strict';

  describe('Geos2s List Controller Tests', function () {
    // Initialize global variables
    var Geos2sListController,
      $scope,
      $httpBackend,
      $state,
      Authentication,
      Geos2sService,
      mockGeos2;

    // The $resource service augments the response object with methods for updating and deleting the resource.
    // If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
    // the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
    // When the toEqualData matcher compares two objects, it takes only object properties into
    // account and ignores methods.
    beforeEach(function () {
      jasmine.addMatchers({
        toEqualData: function (util, customEqualityTesters) {
          return {
            compare: function (actual, expected) {
              return {
                pass: angular.equals(actual, expected)
              };
            }
          };
        }
      });
    });

    // Then we can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($controller, $rootScope, _$state_, _$httpBackend_, _Authentication_, _Geos2sService_) {
      // Set a new global scope
      $scope = $rootScope.$new();

      // Point global variables to injected services
      $httpBackend = _$httpBackend_;
      $state = _$state_;
      Authentication = _Authentication_;
      Geos2sService = _Geos2sService_;

      // create mock article
      mockGeos2 = new Geos2sService({
        _id: '525a8422f6d0f87f0e407a33',
        name: 'Geos2 Name'
      });

      // Mock logged in user
      Authentication.user = {
        roles: ['user']
      };

      // Initialize the Geos2s List controller.
      Geos2sListController = $controller('Geos2sListController as vm', {
        $scope: $scope
      });

      //Spy on state go
      spyOn($state, 'go');
    }));

    describe('Instantiate', function () {
      var mockGeos2List;

      beforeEach(function () {
        mockGeos2List = [mockGeos2, mockGeos2];
      });

      it('should send a GET request and return all Geos2s', inject(function (Geos2sService) {
        // Set POST response
        $httpBackend.expectGET('api/geos2s').respond(mockGeos2List);


        $httpBackend.flush();

        // Test form inputs are reset
        expect($scope.vm.geos2s.length).toEqual(2);
        expect($scope.vm.geos2s[0]).toEqual(mockGeos2);
        expect($scope.vm.geos2s[1]).toEqual(mockGeos2);

      }));
    });
  });
})();
