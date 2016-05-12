(function() {

  // Geos controller
  angular
  .module('geos')
  .controller('GeosController', GeosController);

  GeosController.$inject = ['$scope', '$state', 'Authentication', 'GeosService'];

  function GeosController($scope, $state, Authentication, geo) {
    var vm = this;

    dvdf.timer.utils.init_console_log(true);
    dvdf.timer.utils.start('Starting loading page ...');

    var default_number_format = d3.format(',.0f');

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



    var OFFICE_COLORS = ['#4F81BD', '#C0504D', '#9BBB59', '#8064A2', '#4BACC6', '#F79646', '#BFBFBF', '#95B3D7', '#D99694', '#C3D69B', '#B3A2C7', '#93CDDD', '#FAC090', '#D9D9D9'];

    var THIS_WEBPAGE_COLORS = ['#4F81BD', '#C0504D', '#9BBB59', '#8064A2', '#4BACC6', '#F79646', '#BFBFBF', '#95B3D7', '#D99694', '#C3D69B', '#B3A2C7', '#93CDDD', '#FAC090', '#D9D9D9'];



    dvdf.timer.utils.lap('Starting loading dc_chart_paramters ...');
    dvdf.dc.utils.load_dc_chart_parameters_tsv('dc_chart_parameters.tsv');
    dvdf.timer.utils.lap('Finshed loading dc_chart_paramters ...');


    var chart_geo_world_map = dc.geoChoroplethChart('#chart_geo_world_map');

    var chart_series_evolution_by_sex = dvdf.dc.utils.dc_create_chart({
      dc_chart_id: '#chart_series_evolution_by_sex',
      dc_chart_type: 'series'
    });

    var chart_row_breakdown_by_cancer_type = dc.rowChart('#chart_row_breakdown_by_cancer_type');
    var chart_row_breakdown_by_age_range = dc.rowChart('#chart_row_breakdown_by_age_range');

    var chart_rows = [
      chart_row_breakdown_by_cancer_type,
      chart_row_breakdown_by_age_range
    ];
    var _idx_chart_rows = 0;



    dvdf.timer.utils.lap('Starting loading world map ...');
    d3.json('./custom-world-countries.json', function(countriesJSON) {

      var map_projection = d3.geo.robinson();
      dvdf.timer.utils.lap('Finished loading world map ...');



      dvdf.timer.utils.lap('Starting loading mortalite data ...');

      d3.tsv('./OUTPUT_simply_mortalite_short_detailed_evolution.tsv', function(mortalite_data) {
        dvdf.timer.utils.lap('Finished loading mortalite data ...');

        dvdf.dc.utils.init_preprocessing('mortalite_world', TIME_DIM_NAME, DIM_FIELD_NAMES, VAL_FIELD_NAMES);
        mortalite_data.forEach(function(d) {
          dvdf.dc.utils.process_data('mortalite_world', d);
          // coerce to number
          d.year = +d.year;
          d.k_deaths = +d.deaths / 1e3;
        });

        var ndx = crossfilter(mortalite_data);


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

        var dc_dim_cancer_type = ndx.dimension(function(d) {
          return d['cancer'];
        });
        var dc_dim_age_range = ndx.dimension(function(d) {
          return d.age;
        });




        dvdf.timer.utils.lap('Starting computing crossfilter dimension groups ...');


        var dc_dim_gp_country = dvdf.dc.utils.other_fields_blank_remove_void_bin(
          dc_dim_country.group().reduce(
            dvdf.dc.utils.other_fields_blank_reduce_add(['cancer', 'age'], 'k_deaths'),
            dvdf.dc.utils.other_fields_blank_reduce_remove(['cancer', 'age'], 'k_deaths'),
            dvdf.dc.utils.other_fields_blank_reduce_init(['cancer', 'age'], 'k_deaths')
          ), ['cancer', 'age']
        );

        dvdf.timer.utils.lap('Starting computing crossfilter dimension groups ... (time, sex) ...');

        var dc_dim_gp_time_sex = dvdf.dc.utils.dc_create_group_other_fields_blank({
          dc_dim: dc_dim_time_sex,
          dc_chart_type: 'series',
          database_id: 'mortalite_world',
          dim_field: 'sex',
          other_dim_field_array: ['cancer', 'age'],
          val_field: 'k_deaths'
        });
        dvdf.timer.utils.lap('Finished computing crossfilter dimension groups ... (time, sex) ...');

        dvdf.timer.utils.lap('Starting computing crossfilter dimension groups ... row charts ...');

        var dc_dim_gp_cancer_type = dvdf.dc.utils.non_blank_field_only_remove_void_bin(
          dc_dim_cancer_type.group().reduce(
            dvdf.dc.utils.non_blank_field_only_reduce_add('cancer', 'k_deaths'),
            dvdf.dc.utils.non_blank_field_only_reduce_remove('cancer', 'k_deaths'),
            dvdf.dc.utils.non_blank_field_only_reduce_init('cancer', 'k_deaths')
          ), 'cancer'
        );
        var dc_dim_gp_age_range = dvdf.dc.utils.non_blank_field_only_remove_void_bin(
          dc_dim_age_range.group().reduce(
            dvdf.dc.utils.non_blank_field_only_reduce_add('age', 'k_deaths'),
            dvdf.dc.utils.non_blank_field_only_reduce_remove('age', 'k_deaths'),
            dvdf.dc.utils.non_blank_field_only_reduce_init('age', 'k_deaths')
          ), 'age'
        );

        dvdf.timer.utils.lap('Finished computing crossfilter dimension groups ... row charts ...');

        chart_geo_world_map
        .dimension(dc_dim_country)
        .group(dc_dim_gp_country);

        dvdf.dc.utils.dc_setup_chart({
          chart: chart_series_evolution_by_sex,
          dc_chart_type: 'series',
          database_id: 'mortalite_world',
          dc_dimension: dc_dim_time_sex,
          dc_group: dc_dim_gp_time_sex,
          dim_field: 'sex',
          val_field: 'k_deaths'
        });


        chart_row_breakdown_by_cancer_type
        .dimension(dc_dim_cancer_type)
        .group(dc_dim_gp_cancer_type);
        chart_row_breakdown_by_age_range
        .dimension(dc_dim_age_range)
        .group(dc_dim_gp_age_range);

        var width_geo_world_map = document.getElementById('geo_world_map').offsetWidth - 100;

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

        var width_series_evolution_by_sex = document.getElementById('series_evolution_by_sex').offsetWidth;

        chart_series_evolution_by_sex
        .width(width_series_evolution_by_sex)
        .height(250)
        .brushOn(false)
        .ordinalColors(THIS_WEBPAGE_COLORS)
        .legend(dc.legend().x(60).y(10).itemHeight(8).gap(8).horizontal(1).legendWidth(120).itemWidth(60))
        .x(d3.scale.linear().domain([1960, 2015]))
        .elasticY(true)
        .xAxis().ticks(4);
        chart_series_evolution_by_sex.xAxis().ticks(6)
        .tickFormat(function(d) {
          return ((d == 1960) || (d == 2000)) ? d : ('\'' + default_number_format((d < 2000) ? (d - 1900) : (d - 2000)));
        });
        chart_series_evolution_by_sex.yAxis().ticks(6)
        .tickFormat(function(d) {
          return default_number_format(d) + 'k';
        });
        chart_series_evolution_by_sex.margins().left += 20;

        var width_series_evolution_by_sex = document.getElementById('row_breakdown').offsetWidth - 50;


        for (var i = 0; i < chart_rows.length; i++) {
          chart_rows[i]
          .width(width_series_evolution_by_sex)
          .height(400)
          .ordinalColors(THIS_WEBPAGE_COLORS)
          .margins({
            top: 00,
            left: 40,
            right: 10,
            bottom: 20
          })
          .gap(1)
          .labelOffsetX(-40)
          .title(function(d) {
            return default_number_format(d.value) + 'k';
          })
          .valueAccessor(function(d) {
            return d3.round(d.value, 3);
          })
          .ordering(function(d) {
            return -d.value
          })
          .renderTitleLabel(true)
          .elasticX(true)
          .xAxis().ticks(4);
          chart_rows[i].xAxis().ticks(4)
          .tickFormat(function(d) {
            return default_number_format(d / 1e3) + 'M';
          });
          chart_rows[i].filter = function() {};
        }

        chart_row_breakdown_by_cancer_type
        .ordering(function(d) {
          return -d.value;
        });
        chart_row_breakdown_by_age_range
        .ordering(function(d) {
          return -AGE_RANGE_ORDER.indexOf(d.key);
        });


        dvdf.timer.utils.lap('Starting rendering dc.js charts ...');

        dc.renderAll();

        dvdf.timer.utils.stop('Finished loading webpage ...');

      });
    });

    vm.reset = function() {
      chart_geo_world_map.filterAll();
      dc.redrawAll();
    }
  }
})();
