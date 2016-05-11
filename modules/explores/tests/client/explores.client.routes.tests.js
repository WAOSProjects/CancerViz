(function () {
  'use strict';

  describe('Explores Route Tests', function () {
    // Initialize global variables
    var $scope,
      ExploresService;

    //We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _ExploresService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      ExploresService = _ExploresService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('explores');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/explores');
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
          ExploresController,
          mockExplore;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('explores.view');
          $templateCache.put('modules/explores/client/views/view-explore.client.view.html', '');

          // create mock Explore
          mockExplore = new ExploresService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Explore Name'
          });

          //Initialize Controller
          ExploresController = $controller('ExploresController as vm', {
            $scope: $scope,
            exploreResolve: mockExplore
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:exploreId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.exploreResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(viewstate, {
            exploreId: 1
          })).toEqual('/explores/1');
        }));

        it('should attach an Explore to the controller scope', function () {
          expect($scope.vm.explore._id).toBe(mockExplore._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe('modules/explores/client/views/view-explore.client.view.html');
        });
      });

      describe('Create Route', function () {
        var createstate,
          ExploresController,
          mockExplore;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('explores.create');
          $templateCache.put('modules/explores/client/views/form-explore.client.view.html', '');

          // create mock Explore
          mockExplore = new ExploresService();

          //Initialize Controller
          ExploresController = $controller('ExploresController as vm', {
            $scope: $scope,
            exploreResolve: mockExplore
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.exploreResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/explores/create');
        }));

        it('should attach an Explore to the controller scope', function () {
          expect($scope.vm.explore._id).toBe(mockExplore._id);
          expect($scope.vm.explore._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe('modules/explores/client/views/form-explore.client.view.html');
        });
      });

      describe('Edit Route', function () {
        var editstate,
          ExploresController,
          mockExplore;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('explores.edit');
          $templateCache.put('modules/explores/client/views/form-explore.client.view.html', '');

          // create mock Explore
          mockExplore = new ExploresService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Explore Name'
          });

          //Initialize Controller
          ExploresController = $controller('ExploresController as vm', {
            $scope: $scope,
            exploreResolve: mockExplore
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:exploreId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.exploreResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(editstate, {
            exploreId: 1
          })).toEqual('/explores/1/edit');
        }));

        it('should attach an Explore to the controller scope', function () {
          expect($scope.vm.explore._id).toBe(mockExplore._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe('modules/explores/client/views/form-explore.client.view.html');
        });

        xit('Should go to unauthorized route', function () {

        });
      });

    });
  });
})();
