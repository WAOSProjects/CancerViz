(function() {

  angular
  .module('geos')
  .controller('GeosMultiController', GeosMultiController);

  GeosMultiController.$inject = ['$scope', '$state', 'Authentication', 'GeosService'];

  function GeosMultiController($scope, $state, Authentication, geo) {
    var vm = this;

    dvdf.timer.utils.init_console_log(true);
    dvdf.timer.utils.start('Starting loading page ...');

    var default_number_format = d3.format(',.0f');
    var k_number_format = d3.format(',.3f');

    var TIME_DIM_NAME = 'year';
    var DIM_FIELD_NAMES = [
      'country_name',
      'cancer',
      'age',
      'sex'
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


    var CSEBASSM_NB_ROWS = 3;
    var CSEBASSM_NB_COLS = 6;

    var _idx_csebassm_row = 0;
    var _idx_csebassm_col = 0;
    var _idx_csebassm_age_col = 0;

    var _int_loop_counter_csebassm = 0;

    var csebassm_ROW_SEX_INDICATOR = [{
      'Male': 1,
      'Female': 1
    }, {
      'Male': 1,
      'Female': 0
    }, {
      'Male': 0,
      'Female': 1
    }, ];

    var csebassm_AGE_RANGES = [
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
      '85+',
      'TOTAL'
    ];

    var csebassm_COL_AGE_INDICATOR = new Array(CSEBASSM_NB_COLS);
    for (_idx_csebassm_col = 0; _idx_csebassm_col < CSEBASSM_NB_COLS; _idx_csebassm_col++) {
      csebassm_COL_AGE_INDICATOR[_idx_csebassm_col] = new Array(CSEBASSM_NB_COLS);
      for (_idx_csebassm_age_col = 0; _idx_csebassm_age_col < csebassm_AGE_RANGES.length - 1; _idx_csebassm_age_col++) {
        csebassm_COL_AGE_INDICATOR[_idx_csebassm_col][csebassm_AGE_RANGES[_idx_csebassm_age_col]] = (_idx_csebassm_col == Math.floor(_idx_csebassm_age_col / 3)) ? 1 : 0;
      }
      csebassm_COL_AGE_INDICATOR[_idx_csebassm_col][csebassm_AGE_RANGES[csebassm_AGE_RANGES.length - 1]] = 1;
    }

    function IDX__AGE__INDICATOR_BOOLEAN_FUNCTION(l_idx_csebassm_row, l_idx_csebassm_col, age_range) {
      return csebassm_AGE_RANGES[CSEBASSM_NB_COLS * l_idx_csebassm_row + l_idx_csebassm_col] == age_range;
    }

    var sm_ndx;


    function load_country(country) {
      var country_file;
      if (country == '') {
        country_file = './OUTPUT_simply_mortalite_by_time_age_range_sex.tsv';
      } else {
        country_file = './_by_geography/OUTPUT_simply_mortalite_' + country + '_by_time_age_range_sex.tsv';
      }
      d3.tsv(country_file, function(sm_data) {
        dvdf.dc.utils.init_preprocessing('sm_data', TIME_DIM_NAME, DIM_FIELD_NAMES, VAL_FIELD_NAMES);
        sm_data.forEach(function(d) {
          dvdf.dc.utils.process_data('sm_data', d);
          d.year = +d.year;
          d.k_deaths = +d.deaths / 1e3;
        });
        sm_ndx.remove();
        sm_ndx.add(sm_data);
        dc.redrawAll();
      });
    }


    var OFFICE_COLORS = ['#4F81BD', '#C0504D', '#9BBB59', '#8064A2', '#4BACC6', '#F79646', '#BFBFBF', '#95B3D7', '#D99694', '#C3D69B', '#B3A2C7', '#93CDDD', '#FAC090', '#D9D9D9'];

    var THIS_WEBPAGE_COLORS = ['#4F81BD', '#C0504D', '#9BBB59', '#8064A2', '#4BACC6', '#F79646', '#BFBFBF', '#95B3D7', '#D99694', '#C3D69B', '#B3A2C7', '#93CDDD', '#FAC090', '#D9D9D9'];



    dvdf.timer.utils.lap('Starting loading dc_chart_paramters ...');
    dvdf.dc.utils.load_dc_chart_parameters_tsv('dc_chart_parameters.tsv');
    dvdf.timer.utils.lap('Finshed loading dc_chart_paramters ...');


    var chart_geo_world_map = dc.geoChoroplethChart('#chart_geo_world_map');

    var chart_series_evolution_by_sex_age_small_multiples = new Array(CSEBASSM_NB_ROWS);
    for (_idx_csebassm_row = 0; _idx_csebassm_row < CSEBASSM_NB_ROWS; _idx_csebassm_row++) {
      chart_series_evolution_by_sex_age_small_multiples[_idx_csebassm_row] = new Array(CSEBASSM_NB_COLS);
      for (_idx_csebassm_col = 0; _idx_csebassm_col < CSEBASSM_NB_COLS; _idx_csebassm_col++) {
        chart_series_evolution_by_sex_age_small_multiples[_idx_csebassm_row][_idx_csebassm_col] = dc.seriesChart('#chart_series_evolution_by_age_' + _idx_csebassm_row + '_' + _idx_csebassm_col);
      }
    }


    dvdf.timer.utils.lap('Starting loading world map ...');
    d3.json('./custom-world-countries.json', function(countriesJSON) {

      var map_projection = d3.geo.robinson();
      dvdf.timer.utils.lap('Finished loading world map ...');
      dvdf.timer.utils.lap('Starting loading mortalite data ...');

      d3.tsv('./OUTPUT_simply_mortalite_short_detailed_evolution.tsv', function(mortalite_data) {
        dvdf.timer.utils.lap('Finished loading mortalite data ...');
        dvdf.timer.utils.lap('Starting loading mortalite data for small multiples ...');

        d3.tsv('./OUTPUT_simply_mortalite_by_time_age_range_sex.tsv', function(sm_data) {
          dvdf.timer.utils.lap('Finished loading mortalite data for small multiples ...');
          dvdf.dc.utils.init_preprocessing('mortalite_world', TIME_DIM_NAME, DIM_FIELD_NAMES, VAL_FIELD_NAMES);
          mortalite_data.forEach(function(d) {
            dvdf.dc.utils.process_data('mortalite_world', d);
            d.year = +d.year;
            d.k_deaths = +d.deaths / 1e3;
          });

          dvdf.dc.utils.init_preprocessing('sm_data', TIME_DIM_NAME, DIM_FIELD_NAMES, VAL_FIELD_NAMES);
          sm_data.forEach(function(d) {
            dvdf.dc.utils.process_data('sm_data', d);
            d.year = +d.year;
            d.k_deaths = +d.deaths / 1e3;
          });

          var ndx = crossfilter(mortalite_data);
          sm_ndx = crossfilter(sm_data);

          dvdf.timer.utils.lap('Starting computing crossfilter dimensions ...');

          var dc_dim_country = ndx.dimension(function(d) {
            return d.country_name;
          });

          dvdf.timer.utils.lap('Starting computing crossfilter dimensions ... (time, sex) ...');

          var dc_dim_time_sex = dvdf.dc.utils.dc_create_dim({
            crossfilter_ndx: ndx,
            dc_chart_type: 'series',
            database_id: 'mortalite_world',
            dim_field: 'sex'
          });

          dvdf.timer.utils.lap('Finished computing crossfilter dimensions ... (time, sex) ...');

          var sex_age_dim = sm_ndx.dimension(function(d) {
            return [d.year, d.sex];
          })

          dvdf.timer.utils.lap('Starting computing crossfilter dimension groups ...');

          var dc_dim_gp_country = dvdf.dc.utils.other_fields_blank_remove_void_bin(dc_dim_country.group().reduce(dvdf.dc.utils.other_fields_blank_reduce_add(['cancer', 'age'], 'k_deaths'), dvdf.dc.utils.other_fields_blank_reduce_remove(['cancer', 'age'], 'k_deaths'), dvdf.dc.utils.other_fields_blank_reduce_init(['cancer', 'age'], 'k_deaths')), ['cancer', 'age']);

          var sex_age_dim_gps = new Array(CSEBASSM_NB_ROWS);
          for (_idx_csebassm_row = 0; _idx_csebassm_row < CSEBASSM_NB_ROWS; _idx_csebassm_row++) {
            sex_age_dim_gps[_idx_csebassm_row] = new Array(CSEBASSM_NB_COLS);
            for (_idx_csebassm_col = 0; _idx_csebassm_col < CSEBASSM_NB_COLS; _idx_csebassm_col++) {
              sex_age_dim_gps[_idx_csebassm_row][_idx_csebassm_col] = sex_age_dim.group().reduce(dvdf.dc.utils.sm_1D_reduce_add('sex', ['k_deaths'], _idx_csebassm_row, _idx_csebassm_col, 'age', IDX__AGE__INDICATOR_BOOLEAN_FUNCTION), dvdf.dc.utils.sm_1D_reduce_remove('age', ['k_deaths'], _idx_csebassm_row, _idx_csebassm_col, 'age', IDX__AGE__INDICATOR_BOOLEAN_FUNCTION), dvdf.dc.utils.sm_1D_reduce_init('age', ['k_deaths'], _idx_csebassm_row, _idx_csebassm_col, 'age', IDX__AGE__INDICATOR_BOOLEAN_FUNCTION));
            }
          }

          chart_geo_world_map
          .dimension(dc_dim_country)
          .group(dc_dim_gp_country);
          chart_geo_world_map
          .on('pretransition', function(chart) {
            chart.selectAll('path').on('click', function(d) {
              var l_country_selected = d.properties.name;
              chart
              .filter(null)
              .filter(l_country_selected)
              .redraw();
              console.log(l_country_selected);
              load_country(l_country_selected);
            });
          });

          for (_idx_csebassm_row = 0; _idx_csebassm_row < CSEBASSM_NB_ROWS; _idx_csebassm_row++) {
            for (_idx_csebassm_col = 0; _idx_csebassm_col < CSEBASSM_NB_COLS; _idx_csebassm_col++) {
              chart_series_evolution_by_sex_age_small_multiples[_idx_csebassm_row][_idx_csebassm_col]
              .dimension(sex_age_dim)
              .group(sex_age_dim_gps[_idx_csebassm_row][_idx_csebassm_col])
              .seriesAccessor(function(d) {
                return d.key[1]; // dimension field
              })
              .keyAccessor(function(d) {
                return d.key[0]; // time field
              })
              .valueAccessor(function(d) {
                if (d.key[1] in d.value) {
                  return d.value[d.key[1]].k_deaths;
                } else {
                  return 0;
                }
              });
            }
          }

          chart_geo_world_map
          .width(940)
          .height(400)
          .colors(d3.scale.quantize().range(['#E2F2FF', '#C4E4FF', '#9ED2FF', '#81C5FF', '#6BBAFF', '#51AEFF', '#36A2FF', '#1E96FF', '#0089FF', '#0061B5']))
          .colorDomain([0, 10000])
          .colorCalculator(function(d) {
            return d ? chart_geo_world_map.colors()(d) : '#ccc';
          })
          .overlayGeoJson(countriesJSON.features, 'country', function(d) {
            return d.properties.name;
          })
          .projection(map_projection)
          .title(function(d) {
            return 'Country: ' + d.key + '\nDeaths: ' + default_number_format(d.value ? d.value : 0) + 'k';
          });

          var width_dynamic = document.getElementById('row_breakdown').offsetWidth - 50;

          for (_idx_csebassm_row = 0; _idx_csebassm_row < CSEBASSM_NB_ROWS; _idx_csebassm_row++) {
            for (_idx_csebassm_col = 0; _idx_csebassm_col < CSEBASSM_NB_COLS; _idx_csebassm_col++) {
              chart_series_evolution_by_sex_age_small_multiples[_idx_csebassm_row][_idx_csebassm_col]
              .width(width_dynamic)
              .height(120)
              .ordinalColors(THIS_WEBPAGE_COLORS)
              .margins({
                top: 10,
                left: 35,
                right: 5,
                bottom: 20
              })
              .x(d3.scale.linear().domain([1960, 2015]))
              .brushOn(false)

              .clipPadding(10)
              .elasticY(true)
              .legend(dc.legend().x(40).y(0).itemHeight(7).gap(3).legendText(function(d) {
                return d.name;
              }))
              .title(function(d) {
                if (d.key[1] in d.value) {
                  return d.key[1] + ' (' + d.key[0] + '): ' + k_number_format(d.value[d.key[1]].k_deaths);
                } else {
                  return '';
                }
              });
              chart_series_evolution_by_sex_age_small_multiples[_idx_csebassm_row][_idx_csebassm_col].xAxis().ticks(6)
              .tickFormat(function(d) {
                return (d == 2000) ? '2000' : ('\'' + default_number_format((d < 2000) ? (d - 1900) : (d - 2000)));
              });
              chart_series_evolution_by_sex_age_small_multiples[_idx_csebassm_row][_idx_csebassm_col].yAxis().ticks(4)
              .tickFormat(function(d) {
                return d + 'k';
              });
            }
          }


          dvdf.timer.utils.lap('Starting rendering dc.js charts ...');

          dc.renderAll();

          dvdf.timer.utils.stop('Finished loading webpage ...');

        });
      });
    });

    vm.reset = function() {
      chart_geo_world_map.filterAll();
      dc.redrawAll();
    }
  }
})();
