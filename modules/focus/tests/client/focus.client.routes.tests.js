(function () {
  'use strict';

  describe('Focus Route Tests', function () {
    // Initialize global variables
    var $scope,
      FocusService;

    //We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _FocusService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      FocusService = _FocusService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('focus');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/focus');
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
          FocusController,
          mockFocu;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('focus.view');
          $templateCache.put('modules/focus/client/views/view-focu.client.view.html', '');

          // create mock Focu
          mockFocu = new FocusService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Focu Name'
          });

          //Initialize Controller
          FocusController = $controller('FocusController as vm', {
            $scope: $scope,
            focuResolve: mockFocu
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:focuId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.focuResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(viewstate, {
            focuId: 1
          })).toEqual('/focus/1');
        }));

        it('should attach an Focu to the controller scope', function () {
          expect($scope.vm.focu._id).toBe(mockFocu._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe('modules/focus/client/views/view-focu.client.view.html');
        });
      });

      describe('Create Route', function () {
        var createstate,
          FocusController,
          mockFocu;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('focus.create');
          $templateCache.put('modules/focus/client/views/form-focu.client.view.html', '');

          // create mock Focu
          mockFocu = new FocusService();

          //Initialize Controller
          FocusController = $controller('FocusController as vm', {
            $scope: $scope,
            focuResolve: mockFocu
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.focuResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/focus/create');
        }));

        it('should attach an Focu to the controller scope', function () {
          expect($scope.vm.focu._id).toBe(mockFocu._id);
          expect($scope.vm.focu._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe('modules/focus/client/views/form-focu.client.view.html');
        });
      });

      describe('Edit Route', function () {
        var editstate,
          FocusController,
          mockFocu;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('focus.edit');
          $templateCache.put('modules/focus/client/views/form-focu.client.view.html', '');

          // create mock Focu
          mockFocu = new FocusService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Focu Name'
          });

          //Initialize Controller
          FocusController = $controller('FocusController as vm', {
            $scope: $scope,
            focuResolve: mockFocu
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:focuId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.focuResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(editstate, {
            focuId: 1
          })).toEqual('/focus/1/edit');
        }));

        it('should attach an Focu to the controller scope', function () {
          expect($scope.vm.focu._id).toBe(mockFocu._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe('modules/focus/client/views/form-focu.client.view.html');
        });

        xit('Should go to unauthorized route', function () {

        });
      });

    });
  });
})();
