(function() {
  'use strict';

  // Explores controller
  angular
  .module('explores')
  .controller('ExploresController', ExploresController);

  ExploresController.$inject = ['$scope', '$state', 'Authentication', '_', 'ExploresServiceDeathsYears', 'ExploresServiceDeathsCancers', 'ExploresServiceRisqsCancers'];

  function ExploresController($scope, $state, Authentication, _, ExploresServiceDeathsYears, ExploresServiceDeathsCancers, ExploresServiceRisqsCancers) {
    var vm = this;
    vm.authentication = Authentication;

    vm.optionsBarChart = {
      chart: {
        type: 'discreteBarChart',
        height: 450,
        margin: {
          top: 20,
          right: 20,
          bottom: 80,
          left: 100
        },
        x: function(d) {
          return d.label;
        },
        y: function(d) {
          return d.value;
        },
        showValues: false,
        valueFormat: function(d) {
          return d3.format('')(d);
        },
        duration: 500,
        xAxis: {
          axisLabel: 'Years',
          rotateLabels: 50,
          axisLabelDistance: -100
        },
        yAxis: {
          axisLabel: 'Deaths',
          axisLabelDistance: 30
        },
        zoom: {
          enabled: true
        }
      }
    };

    vm.optionsMultiBarChart = {
      chart: {
        type: 'multiBarChart',
        height: 450,
        margin: {
          top: 20,
          right: 20,
          bottom: 45,
          left: 45
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




    vm.optionsDeathsYears = _.cloneDeep(vm.optionsBarChart);
    vm.deathsYears = ExploresServiceDeathsYears.query();

    vm.optionsDeathsCancers = _.cloneDeep(vm.optionsBarChart);
    vm.optionsDeathsCancers.chart.height = 550;
    vm.optionsDeathsCancers.chart.margin.bottom = 250;
    vm.optionsDeathsCancers.chart.xAxis.axisLabel = 'Cancer';
    vm.deathsCancers = ExploresServiceDeathsCancers.query();

    vm.optionsRisqsCancers = _.cloneDeep(vm.optionsBarChart);
    vm.optionsRisqsCancers.chart.height = 550;
    vm.optionsRisqsCancers.chart.margin.bottom = 250;
    vm.optionsRisqsCancers.chart.xAxis.axisLabel = 'Risqs';
    vm.risqsCancers = ExploresServiceRisqsCancers.query();

  }
})();
