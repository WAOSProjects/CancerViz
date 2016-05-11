(function() {
  'use strict';

  // Focus controller
  angular
  .module('focus')
  .controller('FocusController', FocusController);

  FocusController.$inject = ['$scope', '$state', 'Authentication', 'ExploresServiceMustCancers'];

  function FocusController($scope, $state, Authentication, ExploresServiceMustCancers) {
    var vm = this;
    vm.authentication = Authentication;

    vm.optionsMultiBarChart = {
      chart: {
        type: 'multiBarChart',
        height: 450,
        margin: {
          top: 20,
          right: 20,
          bottom: 45,
          left: 70
        },
        clipEdge: true,
        //staggerLabels: true,
        duration: 500,
        stacked: true,
        xAxis: {
          axisLabel: 'Time (ms)',
          showMaxMin: false,
          tickFormat: function(d) {
            return d3.format(',f')(d);
          }
        },
        yAxis: {
          axisLabel: 'Y Axis',
          axisLabelDistance: -20,
          tickFormat: function(d) {
            return d3.format(',.1f')(d);
          }
        }
      }
    };

    vm.optionsMustCancers = _.cloneDeep(vm.optionsMultiBarChart);
    vm.optionsMustCancers.chart.xAxis.axisLabel = 'Years';
    vm.optionsMustCancers.chart.yAxis.axisLabel = 'Deaths';

    vm.mustCancers = ExploresServiceMustCancers.query();
  }
})();
