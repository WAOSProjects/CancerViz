(function () {
  'use strict';

  // Geos2s controller
  angular
    .module('geos2s')
    .controller('Geos2sController', Geos2sController);

  Geos2sController.$inject = ['$scope', '$state', 'Authentication', 'geos2Resolve'];

  function Geos2sController ($scope, $state, Authentication, geos2) {
    var vm = this;

    vm.geos2 = geos2;

    dvdf.timer.utils.init_console_log(true);
    dvdf.timer.utils.start("Start loading page ...");


    /*
     ********************************************************************************
     ********************************************************************************
     * BUSINESS PARAMETERS
     * -- harcoded for now, to be set as parameters later
     ********************************************************************************
     ********************************************************************************
     */

    var default_number_format = d3.format(",.0f");

    var DIM_FIELD_NAMES = [
      'cancer',
      // 'id.cancer',
      'age',
      'country_name',
      'sex',
      'year'
    ];
    var VAL_FIELD_NAMES = [
      'k_deaths'
    ];

    var AGE_RANGE_ORDER = [
      '0-4',
      '5-9',
      '10-14',
      '15-19',
      '20-24',
      '25-29',
      '30-34',
      '35-39',
      '40-44',
      '45-49',
      '50-54',
      '55-59',
      '60-64',
      '65-69',
      '70-74',
      '75-79',
      '80-84',
      '85+'
    ];


    /*
     ********************************************************************************
     ********************************************************************************
     * Color palettes
     ********************************************************************************
     ********************************************************************************
     */

    var OFFICE_COLORS = [
      "#4F81BD", "#C0504D", "#9BBB59", "#8064A2", "#4BACC6", "#F79646", "#BFBFBF",
      "#95B3D7", "#D99694", "#C3D69B", "#B3A2C7", "#93CDDD", "#FAC090", "#D9D9D9"
    ];

    var THIS_WEBPAGE_COLORS = [
      "#4F81BD", "#C0504D", "#9BBB59", "#8064A2", "#4BACC6", "#F79646", "#BFBFBF",
      "#95B3D7", "#D99694", "#C3D69B", "#B3A2C7", "#93CDDD", "#FAC090", "#D9D9D9"
    ];



    /*
     ********************************************************************************
     ********************************************************************************
     * Declare dc.js charts and Crossfilter objects
     *  >> needed for 'reloading data' features (TBC)
     ********************************************************************************
     ********************************************************************************
     */

//### Declare Crossfilter objects
    var ndx;

//### Declare dc.js charts

    var chart_geo_world_map;

    var CHARTS_LIST = [{
      dc_chart_id: '#chart_series_evolution_by_sex',
      // dc_chart: undefined,
      dc_chart_type: 'series'
    }, {
      dc_chart_id: '#chart_row_breakdown_by_cancer_type',
      // dc_chart: undefined,
      dc_chart_type: 'row'
    }, {
      dc_chart_id: '#chart_row_breakdown_by_age_range',
      // dc_chart: undefined,
      dc_chart_type: 'row'
    }];

    var _idx_chart;

//### Dictionary to fetch dc.js chart corresponding to the dc_chart_id
//      >> computed later by dc_bind_chart_ids_with_charts
    var CHARTS_LOOKUP_DICT = {
      // '#chart_0_0': chart_0_0,
    };



    /*
     ****************************************************************************************************************************************************************
     ****************************************************************************************************************************************************************
     ****************************************************************************************************************************************************************
     ****************************************************************************************************************************************************************
     ****************************************************************************************************************************************************************
     ****************************************************************************************************************************************************************
     */



    /*
     ********************************************************************************
     ********************************************************************************
     * Load dc_chart_paramters
     *  >> Feature postponed to a later version of dvdf.js
     ********************************************************************************
     ********************************************************************************
     */

// dvdf.timer.utils.lap("Start loading dc_chart_paramters ...");
// dvdf.dc.utils.load_dc_chart_parameters_tsv("dc_chart_parameters.tsv");
// dvdf.timer.utils.lap("Finshed loading dc_chart_paramters ...");



    /*
     ********************************************************************************
     ********************************************************************************
     * Load data
     ********************************************************************************
     ********************************************************************************
     */
    dvdf.timer.utils.lap("Start loading map & chart data ...");

    d3_queue.queue()
        .defer(d3.json, 'geo/custom-world-countries.json')
        .defer(d3.tsv, '_PRC_DATA/OUTPUT_simply_mortalite_short_detailed_evolution.tsv')
        // .defer(d3.tsv, '_PRC_DATA/OUTPUT_simply_mortalite_detailed_evolution.tsv')
        .await(process_and_load);



    /*
     ********************************************************************************
     ********************************************************************************
     * Callback function after loading data
     ********************************************************************************
     ********************************************************************************
     */
    function process_and_load(error, countriesJSON, mortalite_data) {

      dvdf.timer.utils.lap("Finished loading map & chart data ...");
      //  https://github.com/mbostock/d3/wiki/Geo-Projections
      /*
       var map_projection = d3.geo.albersUsa();
       var map_projection = d3.geo.mercator();
       var map_projection = d3.geo.equirectangular();
       var map_projection = d3.geo.naturalEarth();
       var map_projection = d3.geo.robinson();
       var map_projection = d3.geo.miller();
       */
      var map_projection = d3.geo.robinson();
      dvdf.timer.utils.lap("Finished loading mortalite data ...");
      /*
       Fields loaded are:
       cancer
       id.cancer
       age
       country_name
       sex
       year
       deaths
       crude.rate
       ASR..W.
       Cumulative.risk
       */



      /*
       ********************************************************************************
       ********************************************************************************
       * Preprocess data
       ********************************************************************************
       ********************************************************************************
       */

      dc_preprocess_data('mortalite_world', mortalite_data);
      /*
       dvdf.dc.utils.multiple_datasets_init_preprocessing('mortalite_world', DIM_FIELD_NAMES, VAL_FIELD_NAMES);
       mortalite_data.forEach(function(d) {
       // coerce to number
       d.year = +d.year;
       d.k_deaths = +d.deaths / 1e3;

       dvdf.dc.utils.multiple_datasets_process_data('mortalite_world', d);
       });
       // */



      /*
       ********************************************************************************
       ********************************************************************************
       * Create Crossfilter Objects
       ********************************************************************************
       ********************************************************************************
       */

      //### Create Crossfilter Dimensions and Groups

      //See the [crossfilter API](https://github.com/square/crossfilter/wiki/API-Reference) for reference.
      ndx = crossfilter(mortalite_data);



      /*
       ********************************************************************************
       ********************************************************************************
       * Geo chart ONLY -- Define crossfilter dimensions
       ********************************************************************************
       ********************************************************************************
       */

      var dc_dim_country = ndx.dimension(function(d) {
        return d.country_name;
      });



      /*
       ********************************************************************************
       ********************************************************************************
       * Geo chart ONLY -- Define crossfilter dimension groups
       ********************************************************************************
       ********************************************************************************
       */

      var dc_dim_gp_country = dc_dim_country.group().reduce(
          dvdf.dc.utils.selected_dataset_only_reduce_sum_add('time_country_sex', 'k_deaths'),
          dvdf.dc.utils.selected_dataset_only_reduce_sum_remove('time_country_sex', 'k_deaths'),
          dvdf.dc.utils.selected_dataset_only_reduce_sum_init('time_country_sex', 'k_deaths')
      );



      /*
       ********************************************************************************
       ********************************************************************************
       * Geo chart ONLY -- Set up charts
       ********************************************************************************
       ********************************************************************************
       */

      chart_geo_world_map = dc.geoChoroplethChart('#chart_geo_world_map');

      chart_geo_world_map
          .dimension(dc_dim_country)
          .group(dc_dim_gp_country);



      /*
       ********************************************************************************
       ********************************************************************************
       * Geo chart ONLY -- Format chart
       ********************************************************************************
       ********************************************************************************
       */

      chart_geo_world_map
       .width(1000)
       .height(500)
      //    .width(400) // 2/3 of 960
      //    .height(200) // < 2/3 of 500 = 367
          // default scale: 150
          // default center: [0, 0]
          // default translate: [480, 250]
          // -->> default size: [960, 500]
          .projection(map_projection
              .scale(100)
              .translate([320, 200])
          )
          .colors(d3.scale.quantize().range(["#E2F2FF", "#C4E4FF", "#9ED2FF", "#81C5FF", "#6BBAFF", "#51AEFF", "#36A2FF", "#1E96FF", "#0089FF", "#0061B5"]))
          .colorDomain([0, 10000])
          .colorCalculator(function(d) {
            return d ? chart_geo_world_map.colors()(d) : '#ccc';
          })
          .overlayGeoJson(countriesJSON.features, "country", function(d) {
            return d.properties.name;
          })
          .projection(map_projection)
          .title(function(d) {
            return "Country: " + d.key + "\nDeaths: " + default_number_format(d.value ? d.value : 0) + 'k';
          });



      /*
       ********************************************************************************
       ********************************************************************************
       * Make dc.js charts ready for drawing / rendering
       * Bind dc_chart_ids with dc_charts
       ********************************************************************************
       ********************************************************************************
       */
      dc_make_all_charts_ready(CHARTS_LIST);
      dc_bind_chart_ids_with_charts(CHARTS_LIST, CHARTS_LOOKUP_DICT);



      /*
       ********************************************************************************
       ********************************************************************************
       * Rendering
       ********************************************************************************
       ********************************************************************************
       */

      dvdf.timer.utils.lap("Start rendering dc.js charts ...");
      //#### Rendering

      //simply call `.renderAll()` to render all charts on the page
      dc.renderAll();
      /*
       // Or you can render charts belonging to a specific chart group
       dc.renderAll('group');
       // Once rendered you can call `.redrawAll()` to update charts incrementally when the data
       // changes, without re-rendering everything
       dc.redrawAll();
       // Or you can choose to redraw only those charts associated with a specific chart group
       dc.redrawAll('group');
       */

      dvdf.timer.utils.stop("Finished loading webpage ...");
    };



    /*
     ********************************************************************************
     ********************************************************************************
     * Function to preprocess data
     ********************************************************************************
     ********************************************************************************
     */

    function dc_preprocess_data(database_id, data) {
      dvdf.dc.utils.multiple_datasets_init_preprocessing(database_id, DIM_FIELD_NAMES, VAL_FIELD_NAMES);
      data.forEach(function(d) {
        // coerce to number
        d.year = +d.year;
        d.k_deaths = +d.deaths / 1e3;

        dvdf.dc.utils.multiple_datasets_process_data(database_id, d);
      });
    };



    /*
     ********************************************************************************
     ********************************************************************************
     * Function to make ALL dc.js charts ready for drawing / rendering
     ********************************************************************************
     ********************************************************************************
     */

// function dc_make_all_charts_ready(dc_chart_ids, dc_charts, dc_chart_types) {
    function dc_make_all_charts_ready(dc_chart_list) {
      var n_charts = dc_chart_list.length;

      for (_idx_chart = 0; _idx_chart < n_charts; _idx_chart++) {
        dc_chart_list[_idx_chart].dc_chart = dc_make_one_chart_ready(
            dc_chart_list[_idx_chart].dc_chart_id,
            dc_chart_list[_idx_chart].dc_chart,
            dc_chart_list[_idx_chart].dc_chart_type
        );
      }

    };



    /*
     ********************************************************************************
     ********************************************************************************
     * Function to make dc.js chart ready for drawing / rendering
     ********************************************************************************
     ********************************************************************************
     */

    function dc_make_one_chart_ready(dc_chart_id, dc_chart, dc_chart_type) {

      if (dc_chart != undefined) dc.chartRegistry.deregister(dc_chart);

      /*
       ********************************************************************************
       ********************************************************************************
       * Set up chart
       ********************************************************************************
       ********************************************************************************
       */

      switch (dc_chart_id) {
        case '#chart_series_evolution_by_sex':
          dc_chart = dvdf.dc.utils.dc_init_chart({
            dc_chart_id: dc_chart_id,
            dc_chart_type: dc_chart_type,
            database_id: 'mortalite_world',
            dataset_label: 'time_country_sex',
            crossfilter_ndx: ndx,
            dim_x_field: 'year',
            dim_y_field: 'sex',
            val_field: 'k_deaths',
          });
          break;
        case '#chart_row_breakdown_by_cancer_type':
          dc_chart = dvdf.dc.utils.dc_init_chart({
            dc_chart_id: dc_chart_id,
            dc_chart_type: dc_chart_type,
            database_id: 'mortalite_world',
            dataset_label: 'time_cancer_type_country_sex',
            crossfilter_ndx: ndx,
            dim_field: 'cancer',
            val_field: 'k_deaths',
          });
          break;
        case '#chart_row_breakdown_by_age_range':
          dc_chart = dvdf.dc.utils.dc_init_chart({
            dc_chart_id: dc_chart_id,
            dc_chart_type: dc_chart_type,
            database_id: 'mortalite_world',
            dataset_label: 'time_age_range_country_sex',
            crossfilter_ndx: ndx,
            dim_field: 'age',
            val_field: 'k_deaths',
          });
          break;
        default:
          alert("The dc_chart_id '" + dc_chart_id + "' is invalid!");
          break;
      }

      dvdf.dc.utils.dc_chart_selected_dataset_only_full_std_setup(dc_chart_id);



      /*
       ********************************************************************************
       ********************************************************************************
       * Format chart
       ********************************************************************************
       ********************************************************************************
       */

      /*
       // Defaut formatting
       dc_chart
       .width(768)
       .height(480)
       .renderArea(true) // for 'line' only
       .brushOn(false) // for 'line', 'bar', 'series' only
       .mouseZoomable(true) // for 'line', 'bar', 'series' only
       .renderLabel(true)
       ;
       // */

      dc_chart
      // .colors(d3.scale.ordinal().range(colorbrewer.Set1[9]))
          .colors(d3.scale.ordinal().range(THIS_WEBPAGE_COLORS))
      // .yAxisLabel("Measured Speed km/s")
      // .xAxisLabel("Run")
      // .clipPadding(10)
      // .elasticY(true)
      // .legend(dc.legend().x(350).y(350).itemHeight(13).gap(5).horizontal(1).legendWidth(140).itemWidth(70))
      ;

      // dc_chart.margins().left += 20;

      switch (dc_chart_type) {
        case 'series':
          dc_chart
              .brushOn(false)
              .mouseZoomable(false)
              .filter = function() {};
          // break;
        case 'bar':
        case 'line':
          dc_chart
          // .brushOn(false)
          // .mouseZoomable(true)
              .ordinalColors(THIS_WEBPAGE_COLORS)
              .legend(dc.legend().x(60).y(10).itemHeight(8).gap(8).horizontal(1).legendWidth(120).itemWidth(60))
              .renderLabel(false)
              /*
               .chart(function(c) { return dc.lineChart(c).interpolate('basis'); })
               .x(d3.scale.linear().domain([0,20]))
               /*
               .x(d3.scale.ordinal())
               .xUnits(dc.units.ordinal)
               // */
              .x(d3.scale.linear().domain([1960, 2015]))
              // .yAxisLabel("Measured Speed km/s")
              // .xAxisLabel("Run")
              // .clipPadding(10)
              .elasticY(true)
          ;
          dc_chart.xAxis().ticks(6)
              .tickFormat(function(d) {
                return ((d==1960) || (d==2000)) ? d : ("'" + default_number_format( (d<2000) ? (d-1900) : (d-2000) ) );
              });
          dc_chart.yAxis().ticks(6)
              .tickFormat(function(d) {
                return default_number_format(d) + 'k';
              });
          dc_chart.margins().left += 20;
          // dc_chart.margins().top += 20;
          // dc_chart.margins().bottom -= 20;
          break;
        case 'row':
          dc_chart
              .margins({top: '00', left: '40', right: '10', bottom: '20'})
              .gap(1)
              .labelOffsetX(-40)
              .elasticX(true)
              .renderTitleLabel(true)
          ;
          dc_chart.xAxis().ticks(4)
              .tickFormat(function(d) {
                return default_number_format(d/1e3) + 'M';
              });
          // break;
        case 'pie':
          dc_chart
              .ordinalColors(THIS_WEBPAGE_COLORS)
              .title(function (d) {
                return default_number_format(d.value) + 'k';
              })
              .valueAccessor(function(d) {
                return d3.round(d.value, 3);
              })
              .ordering(function(d) {
                return -d.value;
              })
          // .titleLabelOffsetX(10)
          ;
          dc_chart.filter = function() {};
          break;
        default:
          alert("The dc_chart_type '" + dc_chart_type + "' is not yet supported by dvdf.js");
          break;
      }

      var width_div_bar_evolution_by_sex = document.getElementById('div_bar_evolution_by_sex').offsetWidth;

      switch (dc_chart_id) {
        case '#chart_series_evolution_by_sex':
          dc_chart
              .width(width_div_bar_evolution_by_sex)
              .height(120)
          ;
          break;
        case '#chart_row_breakdown_by_cancer_type':
          dc_chart
              .width(600)
              .height(400)
              .ordering(function(d) {
                return -d.value;
                // return -d.key;
              })
          ;
          break;
        case '#chart_row_breakdown_by_age_range':
          dc_chart
              .width(600)
              .height(400)
              .ordering(function(d) {
                return -AGE_RANGE_ORDER.indexOf(d.key);
              })
          ;
          break;
        default:
          alert("The dc_chart_id '" + dc_chart_id + "' is invalid!");
          break;
      }

      return dc_chart;

    };



    /*
     ********************************************************************************
     ********************************************************************************
     * Function to bind dc_chart_ids with dc_charts
     ********************************************************************************
     ********************************************************************************
     */

    function dc_bind_chart_ids_with_charts(dc_chart_list, dc_chart_lookup_dict) {
      var n_charts = dc_chart_list.length;

      for (_idx_chart = 0; _idx_chart < n_charts; _idx_chart++) {
        dc_chart_lookup_dict[dc_chart_list[_idx_chart].dc_chart_id] = dc_chart_list[_idx_chart].dc_chart;
      }
    };



    /*
     ********************************************************************************
     ********************************************************************************
     * Function to change chart_type and re-render chart
     ********************************************************************************
     ********************************************************************************
     */

    function switch_chart_type(dc_chart_id, dc_chart_type) {
      CHARTS_LOOKUP_DICT[dc_chart_id] = dc_make_one_chart_ready(dc_chart_id, CHARTS_LOOKUP_DICT[dc_chart_id], dc_chart_type);
      CHARTS_LOOKUP_DICT[dc_chart_id].render();
    };



    /*
     ********************************************************************************
     ********************************************************************************
     * Function to change chart_type and re-render chart
     ********************************************************************************
     ********************************************************************************
     */

    function load_detailed_data() {
      dc.filterAll();
      switch_chart_type('#chart_series_evolution_by_sex', 'line');
      d3.tsv('_PRC_DATA/OUTPUT_simply_mortalite_detailed_evolution.tsv', function(error, mortalite_detailed_data) {
        dvdf.timer.utils.start("Start loading detailed data ...");
        dc_preprocess_data('mortalite_world_detailed', mortalite_detailed_data);
        ndx.remove();
        ndx.add(mortalite_detailed_data);
        dc.redrawAll();
        dvdf.timer.utils.stop("Finished loading detailed data ...");
      });
    };



    vm.reset = function() {
      chart_geo_world_map.filterAll();
      dc.redrawAll();
    }


    vm.resetData = function() {
      CHARTS_LOOKUP_DICT['#chart_series_evolution_by_sex'].filterAll();
      dc.redrawAll();
    }

    vm.resetAll = function() {
      dc.filterAll();
      dc.redrawAll();
    }


    vm.switch_chart_type = switch_chart_type ;
    vm.load_detailed_data = load_detailed_data;
    // Remove existing Geos2


  }
})();
