(function () {
  'use strict';

  describe('Geos2s Route Tests', function () {
    // Initialize global variables
    var $scope,
      Geos2sService;

    //We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _Geos2sService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      Geos2sService = _Geos2sService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('geos2s');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/geos2s');
        });

        it('Should be abstract', function () {
          expect(mainstate.abstract).toBe(true);
        });

        it('Should have template', function () {
          expect(mainstate.template).toBe('<ui-view/>');
        });
      });

      describe('View Route', function () {
        var viewstate,
          Geos2sController,
          mockGeos2;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('geos2s.view');
          $templateCache.put('modules/geos2s/client/views/view-geos2.client.view.html', '');

          // create mock Geos2
          mockGeos2 = new Geos2sService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Geos2 Name'
          });

          //Initialize Controller
          Geos2sController = $controller('Geos2sController as vm', {
            $scope: $scope,
            geos2Resolve: mockGeos2
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:geos2Id');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.geos2Resolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(viewstate, {
            geos2Id: 1
          })).toEqual('/geos2s/1');
        }));

        it('should attach an Geos2 to the controller scope', function () {
          expect($scope.vm.geos2._id).toBe(mockGeos2._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe('modules/geos2s/client/views/view-geos2.client.view.html');
        });
      });

      describe('Create Route', function () {
        var createstate,
          Geos2sController,
          mockGeos2;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('geos2s.create');
          $templateCache.put('modules/geos2s/client/views/form-geos2.client.view.html', '');

          // create mock Geos2
          mockGeos2 = new Geos2sService();

          //Initialize Controller
          Geos2sController = $controller('Geos2sController as vm', {
            $scope: $scope,
            geos2Resolve: mockGeos2
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.geos2Resolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/geos2s/create');
        }));

        it('should attach an Geos2 to the controller scope', function () {
          expect($scope.vm.geos2._id).toBe(mockGeos2._id);
          expect($scope.vm.geos2._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe('modules/geos2s/client/views/form-geos2.client.view.html');
        });
      });

      describe('Edit Route', function () {
        var editstate,
          Geos2sController,
          mockGeos2;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('geos2s.edit');
          $templateCache.put('modules/geos2s/client/views/form-geos2.client.view.html', '');

          // create mock Geos2
          mockGeos2 = new Geos2sService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Geos2 Name'
          });

          //Initialize Controller
          Geos2sController = $controller('Geos2sController as vm', {
            $scope: $scope,
            geos2Resolve: mockGeos2
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:geos2Id/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.geos2Resolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(editstate, {
            geos2Id: 1
          })).toEqual('/geos2s/1/edit');
        }));

        it('should attach an Geos2 to the controller scope', function () {
          expect($scope.vm.geos2._id).toBe(mockGeos2._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe('modules/geos2s/client/views/form-geos2.client.view.html');
        });

        xit('Should go to unauthorized route', function () {

        });
      });

    });
  });
})();
