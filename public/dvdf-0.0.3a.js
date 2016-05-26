/*
 ****************************************************************************************************************************************************************
 ****************************************************************************************************************************************************************
 * Data Visualisation & Dashboard Factory
 * v0.0.3a-0.0.2 (alpha version)
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2016 nthl
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 ****************************************************************************************************************************************************************
 ****************************************************************************************************************************************************************
 * Updates:
 *  - NOT backward-compatible
 *  - new data model with:
 *    >> simpler management of multiple datasets within the same csv/tsv file
 *    >> support for the 'deploy to standalone html file' python routine (to be finalized)
 *        - OK so far for the import of the .css & .js files
 *        - pending for the import of the data files (only .csv or .tsv files are expected to be supported in first version)
 * Cancelled and postponed for now:
 *  - management of dc_chart_parameters
 ****************************************************************************************************************************************************************
 ****************************************************************************************************************************************************************
 */


var dvdf = (function () {

  /*
   ****************************************************************************************************************************************************************
   ****************************************************************************************************************************************************************
   * UTILS sub-library for managing timestamping logs
   ****************************************************************************************************************************************************************
   ****************************************************************************************************************************************************************
   */

  var dvdf_timer_utils = (function () {
    // var __TIMESTAMPING_ON = false;
    var __TIMESTAMPING_CONSOLE_LOG = false;
    // logging timestamping in files may be added in the future
    // var __TIMESTAMPING_FILE_LOG = false;

    var __time_beg = 0;
    var __time_med = 0;
    var __time_end = 0;

    /**
     * Determine whether or not to log timestamps to console
     */
    function timer_init_console_log(true_or_false) {
      __TIMESTAMPING_CONSOLE_LOG = true_or_false;
    };

    /**
     * Start timer
     */
    function timer_start(message) {
      if (__TIMESTAMPING_CONSOLE_LOG) {
        __time_beg = new Date();
        __time_end = __time_beg;
        console.log(__time_end.toLocaleString() + ': ' + message);
        return __time_end;
      }
    };
    /**
     * Intermediate status ('lap') of timer
     */
    function timer_lap(message) {
      _prv__timer_lap(message, 'so far');
    };
    /**
     * Stop timer
     */
    function timer_stop(message) {
      _prv__timer_lap(message, 'IN TOTAL');
    };

    function _prv__timer_lap(message, step_message) {
      if (__TIMESTAMPING_CONSOLE_LOG) {
        __time_med = __time_end;
        __time_end = new Date();
        console.log(__time_end.toLocaleString() + ': ' + message);
        console.log('\tLast step: ' + ((__time_end.getTime() - __time_med.getTime()) / 1e3) + ' s.'
          + '\tEntire step ' + step_message + ': ' + ((__time_end.getTime() - __time_beg.getTime()) / 1e3) + ' s.');
        return __time_end;
      }
    };

    // dvdf_timer_utils
    return {
      // UTILS for timestamping logs
      init_console_log: timer_init_console_log,
      start: timer_start,
      lap: timer_lap,
      stop: timer_stop,
    }

  })();



  /*
   ****************************************************************************************************************************************************************
   ****************************************************************************************************************************************************************
   * UTILS sub-library for managing dc.js charts
   ****************************************************************************************************************************************************************
   ****************************************************************************************************************************************************************
   */

  var dvdf_dc_utils = (function () {

    /*
     ************************************************************************************************************************
     ************************************************************************************************************************
     * UTILS for managing dc_chart_parameters
     ************************************************************************************************************************
     ************************************************************************************************************************
     */
    var __DC_CHART_PARAMETERS = {};
    function load_dc_chart_parameters_tsv(tsv_file) {
/*
      d3.tsv(tsv_file, function(dc_chart_parameters_tsv) {
        __DC_CHART_PARAMETERS['default'] = {};
        __DC_CHART_PARAMETERS['series'] = {};

        dc_chart_parameters_tsv.forEach(function (attr_row) {
          __DC_CHART_PARAMETERS['default'][attr_row.attribute] = attr_row.default;
          __DC_CHART_PARAMETERS['series'][attr_row.attribute] = (attr_row.series == '-') ? attr_row.default : attr_row.series;
        });
      });
// */
    };



    /*
     ************************************************************************************************************************
     ************************************************************************************************************************
     * UTILS for preprocessing data (to compute useful stats and static data)
     ************************************************************************************************************************
     ************************************************************************************************************************
     */

    /*
     ********************************************************************************
     * Maintain a registry of all known databases loaded
     ********************************************************************************
     */
    // dictionary with 'database_id' as key
    var __DATABASE_REGISTRY = {};

    /*
     ********************************************************************************
     * Utilities for databases with a unique, clean dataset
     ********************************************************************************
     */
    function unique_dataset_init_preprocessing(database_id, dim_field_array, val_field_array) {
      __DATABASE_REGISTRY[database_id] = {
        __DIM_FIELD_ARRAY: dim_field_array,
        __VAL_FIELD_ARRAY: val_field_array,
        /*
         ********************************************************************************
         * Dimension fields : list of values
         * 2-D 'JSON dict' array
         *   >> dim_field_value_arrays[dim_field_name] is the list of values
         *        for the dimension 'dim_field_name' (with count of occurences)
         *   >> dim_field_value_arrays[dim_field_name][dim_field_value] is the count
         *        of occurences of the 'dim_field_value' along the 'dim_field_name'
         ********************************************************************************
         */
        __dim_field_value_arrays: {},
        /*
         ********************************************************************************
         * Value fields : stats
         * 1-D 'JSON dict' array
         *   >> val_field_stat_arrays[val_field_name] contains a JSON
         *        with the useful stats for the value 'val_field_name'
         *        (implemented for the moment: min, max)
         ********************************************************************************
         */
        __val_field_stat_arrays: {},
      };

      __DATABASE_REGISTRY[database_id].__DIM_FIELD_ARRAY.forEach(function(dim_field_name) {
        __DATABASE_REGISTRY[database_id].__dim_field_value_arrays[dim_field_name] = {};
      });
      __DATABASE_REGISTRY[database_id].__VAL_FIELD_ARRAY.forEach(function(val_field_name) {
        __DATABASE_REGISTRY[database_id].__val_field_stat_arrays[val_field_name] = {
          _min: +Infinity,
          _max: -Infinity
        };
      });
    };

    function unique_dataset_process_data(database_id, d) {
      __DATABASE_REGISTRY[database_id].__DIM_FIELD_ARRAY.forEach(function(dim_field_name) {
        if (!(d[dim_field_name] in __DATABASE_REGISTRY[database_id].__dim_field_value_arrays[dim_field_name])) {
          __DATABASE_REGISTRY[database_id].__dim_field_value_arrays[dim_field_name][d[dim_field_name]] = 0;
        }
        ++__DATABASE_REGISTRY[database_id].__dim_field_value_arrays[dim_field_name][d[dim_field_name]];
      });
      __DATABASE_REGISTRY[database_id].__VAL_FIELD_ARRAY.forEach(function(val_field_name) {
        __DATABASE_REGISTRY[database_id].__val_field_stat_arrays[val_field_name]['_min']
          = Math.min(d[val_field_name], __DATABASE_REGISTRY[database_id].__val_field_stat_arrays[val_field_name]['_min']);
        __DATABASE_REGISTRY[database_id].__val_field_stat_arrays[val_field_name]['_max']
          = Math.max(d[val_field_name], __DATABASE_REGISTRY[database_id].__val_field_stat_arrays[val_field_name]['_max']);
      });
    };

    /*
     ********************************************************************************
     * Utilities for databases with multiple sub-datasets
     ********************************************************************************
     */
    function multiple_datasets_init_preprocessing(database_id, dim_field_array, val_field_array) {
      __DATABASE_REGISTRY[database_id] = {
        __DIM_FIELD_ARRAY:      dim_field_array,
        __VAL_FIELD_ARRAY:      val_field_array,
        /*
         ********************************************************************************
         * Datasets : list of datasets
         * 1-D 'JSON dict' array
         *   >> __DATASET_LABEL_ARRAY[dataset_label] is the count
         *        of records within the dataset
         ********************************************************************************
         */
        __DATASETS_WITH_COUNT_OF_RECORDS:  {},
        /*
         ********************************************************************************
         * Dimension fields : list of values
         * 3-D 'JSON dict' array
         *   >> dim_field_value_arrays[dataset_label] is the list of datasets
         *   >> dim_field_value_arrays[dataset_label][dim_field_name] is the list of values
         *        for the dimension 'dim_field_name' (with count of occurences)
         *   >> dim_field_value_arrays[dataset_label][dim_field_name][dim_field_value] is the count
         *        of occurences of the 'dim_field_value' along the 'dim_field_name'
         ********************************************************************************
         */
        __dim_field_value_arrays: {},
        /*
         ********************************************************************************
         * Value fields : stats
         * 2-D 'JSON dict' array
         *   >> dim_field_value_arrays[dataset_label] is the list of datasets
         *   >> val_field_stat_arrays[dataset_label][val_field_name] contains a JSON
         *        with the useful stats for the value 'val_field_name'
         *        (implemented for the moment: min, max)
         ********************************************************************************
         */
        __val_field_stat_arrays: {},
      };
    };

    function multiple_datasets_process_data(database_id, d) {
      if (d._dataset in __DATABASE_REGISTRY[database_id].__DATASETS_WITH_COUNT_OF_RECORDS) {
        ++__DATABASE_REGISTRY[database_id].__DATASETS_WITH_COUNT_OF_RECORDS[d._dataset];
        __DATABASE_REGISTRY[database_id].__DIM_FIELD_ARRAY.forEach(function(dim_field_name) {
          if (!(d[dim_field_name] in __DATABASE_REGISTRY[database_id].__dim_field_value_arrays[d._dataset][dim_field_name])) {
            __DATABASE_REGISTRY[database_id].__dim_field_value_arrays[d._dataset][dim_field_name][d[dim_field_name]] = 0;
          }
          ++__DATABASE_REGISTRY[database_id].__dim_field_value_arrays[d._dataset][dim_field_name][d[dim_field_name]];
        });
        __DATABASE_REGISTRY[database_id].__VAL_FIELD_ARRAY.forEach(function(val_field_name) {
          __DATABASE_REGISTRY[database_id].__val_field_stat_arrays[d._dataset][val_field_name]['_min']
            = Math.min(d[val_field_name], __DATABASE_REGISTRY[database_id].__val_field_stat_arrays[d._dataset][val_field_name]['_min']);
          __DATABASE_REGISTRY[database_id].__val_field_stat_arrays[d._dataset][val_field_name]['_max']
            = Math.max(d[val_field_name], __DATABASE_REGISTRY[database_id].__val_field_stat_arrays[d._dataset][val_field_name]['_max']);
        });
      } else {
        __DATABASE_REGISTRY[database_id].__DATASETS_WITH_COUNT_OF_RECORDS[d._dataset] = 0;
        __DATABASE_REGISTRY[database_id].__dim_field_value_arrays[d._dataset] = {};
        __DATABASE_REGISTRY[database_id].__DIM_FIELD_ARRAY.forEach(function(dim_field_name) {
          __DATABASE_REGISTRY[database_id].__dim_field_value_arrays[d._dataset][dim_field_name] = {};
        });
        __DATABASE_REGISTRY[database_id].__val_field_stat_arrays[d._dataset] = {};
        __DATABASE_REGISTRY[database_id].__VAL_FIELD_ARRAY.forEach(function(val_field_name) {
          __DATABASE_REGISTRY[database_id].__val_field_stat_arrays[d._dataset][val_field_name] = {
            _min: +Infinity,
            _max: -Infinity
          };
        });
      }
    };

    /*
     ********************************************************************************
     * Utilities for accessing the dim_field_value_arrays & val_field_stat_arrays
     *   >> common for both (i) unique, clean dataset and (ii) multiple sub-datasets
     ********************************************************************************
     */
    function get_dim_field_value_arrays(database_id, dataset_label) {
      if (dataset_label == undefined) {
        return __DATABASE_REGISTRY[database_id].__dim_field_value_arrays;
      } else {
        return __DATABASE_REGISTRY[database_id].__dim_field_value_arrays[dataset_label];
      }
    };

    function get_val_field_stat_arrays(database_id, dataset_label) {
      if (dataset_label == undefined) {
        return __DATABASE_REGISTRY[database_id].__val_field_stat_arrays;
      } else {
        return __DATABASE_REGISTRY[database_id].__val_field_stat_arrays[dataset_label];
      }
    };



    /*
     ************************************************************************************************************************
     ************************************************************************************************************************
     * UTILS for managing crossfilter dimensions and groups
     ************************************************************************************************************************
     ************************************************************************************************************************
     */
    function remove_empty_bins(source_group) {
      return {
        all: function() {
          return source_group.all().filter(function(d) {
            return d.value != 0;
          });
        }
      };
    };

    /*
     ********************************************************************************
     * SHOULD BE DEPRECATED
     * CONSTANT series
     ********************************************************************************
     */
/*
    function constant_reduce_add() {
      return function(p, v) {
        return 1;
      };
    };

    function constant_reduce_remove() {
      return function(p, v) {
        return 1;
      };
    };

    function constant_reduce_init() {
      return function() {
        return 1;
      };
    };
// /*

    /*
     ********************************************************************************
     * SHOULD BE DEPRECATED
     * Standard sums for non-blank field only
     ********************************************************************************
     */
//*
    function non_blank_field_only_reduce_sum_add(dim_field, val_field) {
      return function(p, v) {
        if (v[dim_field] != '') {
          p += v[val_field];
        }
        return p;
      };
    };

    function non_blank_field_only_reduce_sum_remove(dim_field, val_field) {
      return function(p, v) {
        if (v[dim_field] != '') {
          p -= v[val_field];
        }
        return p;
      };
    };

    function non_blank_field_only_reduce_sum_init(dim_field, val_field) {
      return function() {
        return 0;
      };
    };

    function non_blank_field_only_remove_void_bin(source_group) {
      return {
        all: function() {
          return source_group.all().filter(function(d) {
            return d.key != '';
          });
        }
      };
    };
// /*

    /*
     ********************************************************************************
     * SHOULD BE DEPRECATED
     * Standard sums for non-blank field array only
     ********************************************************************************
     */
    function non_blank_field_array_only_reduce_sum_add(dim_field_array, val_field) {
      return function(p, v) {
        var l_valid_record = true;
        dim_field_array.forEach(function(dim_field) {
          if (v[dim_field] == '') l_valid_record = false;
        });
        if (l_valid_record) {
          p += v[val_field];
        }
        return p;
      };
    };

    function non_blank_field_array_only_reduce_sum_remove(dim_field_array, val_field) {
      return function(p, v) {
        var l_valid_record = true;
        dim_field_array.forEach(function(dim_field) {
          if (v[dim_field] == '') l_valid_record = false;
        });
        if (l_valid_record) {
          p -= v[val_field];
        }
        return p;
      };
    };

    function non_blank_field_array_only_reduce_sum_init(dim_field_array, val_field) {
      return function() {
        return 0;
      };
    };

    function non_blank_field_array_only_remove_void_bin(source_group) {
      return {
        all: function() {
          return source_group.all().filter(function(d) {
            return d.key != '';
          });
        }
      };
    };

    /*
     ********************************************************************************
     * SHOULD BE DEPRECATED
     * Standard sums for non-blank field only - val_field_array
     ********************************************************************************
     */
/*
    function non_blank_field_only_reduce_array_add(dim_field, val_field_array) {
      return function(p, v) {
        if (v[dim_field] != '') {
          val_field_array.forEach(function(val_field) {
            p[val_field] += v[val_field];
          });
        }
        return p;
      };
    };

    function non_blank_field_only_reduce_array_remove(dim_field, val_field_array) {
      return function(p, v) {
        if (v[dim_field] != '') {
          val_field_array.forEach(function(val_field) {
            p[val_field] -= v[val_field];
          });
        }
        return p;
      };
    };

    function non_blank_field_only_reduce_array_init(dim_field, val_field_array) {
      return function() {
        var p = {};
        val_field_array.forEach(function(val_field) {
          p[val_field] = 0;
        });
        return p;
      };
    };

    function non_blank_field_only_remove_array_void_bin(source_group, dim_field) {
      return {
        all: function() {
          return source_group.all().filter(function(d) {
            return d.key != '';
          });
        }
      };
    };
// /*

    /*
     ********************************************************************************
     * SHOULD BE DEPRECATED
     * Standard sums for rows with other fields blank
     ********************************************************************************
     */
/*
    function other_fields_blank_reduce_add(other_dim_field_array, val_field) {
      return function(p, v) {
        var l_valid_record = true;
        other_dim_field_array.forEach(function(other_dim_field) {
          if (v[other_dim_field] != '') l_valid_record = false;
        });
        if (l_valid_record) {
          p += v[val_field];
        }
        return p;
      };
    };

    function other_fields_blank_reduce_remove(other_dim_field_array, val_field) {
      return function(p, v) {
        var l_valid_record = true;
        other_dim_field_array.forEach(function(other_dim_field) {
          if (v[other_dim_field] != '') l_valid_record = false;
        });
        if (l_valid_record) {
          p -= v[val_field];
        }
        return p;
      };
    };

    function other_fields_blank_reduce_init(other_dim_field_array, val_field) {
      return function() {
        return 0;
      };
    };

    function other_fields_blank_remove_void_bin(source_group, other_dim_field_array) {
      return {
        all: function() {
          return source_group.all().filter(function(d) {
            return d.key != '';
          });
        }
      };
    };
// /*

    /*
     ********************************************************************************
     * FOR SELECTED DATASET ONLY -- Standard sums
     ********************************************************************************
     */
    function selected_dataset_only_reduce_sum_add(dataset_label, val_field) {
      return function(p, v) {
        if (v._dataset == dataset_label) {
          p += v[val_field];
        }
        return p;
      };
    };

    function selected_dataset_only_reduce_sum_remove(dataset_label, val_field) {
      return function(p, v) {
        if (v._dataset == dataset_label) {
          p -= v[val_field];
        }
        return p;
      };
    };

    function selected_dataset_only_reduce_sum_init(dataset_label, val_field) {
      return function() {
        return 0;
      };
    };

    /*
     ********************************************************************************
     * FOR SELECTED DATASET ONLY -- Standard sums - for an array of value fields
     ********************************************************************************
     */
    function selected_dataset_only_reduce_array_sum_add(dataset_label, val_field_array) {
      return function(p, v) {
        if (v._dataset == dataset_label) {
          val_field_array.forEach(function(val_field) {
            p[val_field] += v[val_field];
          });
        }
        return p;
      };
    };

    function selected_dataset_only_reduce_array_sum_remove(dataset_label, val_field_array) {
      return function(p, v) {
        if (v._dataset == dataset_label) {
          val_field_array.forEach(function(val_field) {
            p[val_field] -= v[val_field];
          });
        }
        return p;
      };
    };

    function selected_dataset_only_reduce_array_sum_init(dataset_label, val_field_array) {
      return function() {
        var p = {};
        val_field_array.forEach(function(val_field) {
          p[val_field] = 0;
        });
        return p;
      };
    };

    /*
     ********************************************************************************
     * FOR UNIQUE DATASET DATABASE -- 1-D "dim series" for stacked bar / line dc.js charts
     *   >> from the database indexed by 'database_id'
     *   >> along the dim_field
     ********************************************************************************
     */
    function unique_dataset_one_D_reduce_sum_add(database_id, dim_field, val_field) {
      return function(p, v) {
        if (v[dim_field] != '') {
          ++p[v[dim_field]]._count;
          p[v[dim_field]][val_field] += v[val_field];
        }
        return p;
      };
    };

    function unique_dataset_one_D_reduce_sum_remove(database_id, dim_field, val_field) {
      return function(p, v) {
        if (v[dim_field] != '') {
          --p[v[dim_field]]._count;
          p[v[dim_field]][val_field] -= v[val_field];
        }
        return p;
      };
    };

    function unique_dataset_one_D_reduce_sum_init(database_id, dim_field, val_field) {
      return function() {
        var p = {};
        for (var dim_field_value in __DATABASE_REGISTRY[database_id].__dim_field_value_arrays[dim_field]) {
          p[dim_field_value] = {
            _count: 0
          };
          p[dim_field_value][val_field] = 0;
        };
        return p;
      };
    };

    /*
     ********************************************************************************
     * FOR SELECTED DATASET ONLY -- 1-D "dim series" for stacked bar / line dc.js charts
     *   >> from the database indexed by 'database_id'
     *   >> for the dataset labeled 'dataset_label'
     *   >> along the dim_field
     ********************************************************************************
     */
    function selected_dataset_only_one_D_reduce_sum_add(database_id, dataset_label, dim_field, val_field) {
      return function(p, v) {
        if (v._dataset == dataset_label) {
          ++p[v[dim_field]]._count;
          p[v[dim_field]][val_field] += v[val_field];
        }
        return p;
      };
    };

    function selected_dataset_only_one_D_reduce_sum_remove(database_id, dataset_label, dim_field, val_field) {
      return function(p, v) {
        if (v._dataset == dataset_label) {
          --p[v[dim_field]]._count;
          p[v[dim_field]][val_field] -= v[val_field];
        }
        return p;
      };
    };

    function selected_dataset_only_one_D_reduce_sum_init(database_id, dataset_label, dim_field, val_field) {
      return function() {
        var p = {};
        for (var dim_field_value in __DATABASE_REGISTRY[database_id].__dim_field_value_arrays[dataset_label][dim_field]) {
          p[dim_field_value] = {
            _count: 0
          };
          p[dim_field_value][val_field] = 0;
        };
        return p;
      };
    };

    /*
     ********************************************************************************
     * Utilities for 1-D "dim series" for stacked bar / line dc.js charts
     *   >> common for both (i) unique, clean dataset and (ii) multiple sub-datasets
     ********************************************************************************
     */
    function one_D_select_stack(dim_field_value, val_field) {
      var __dim_field_value = dim_field_value;
      return function(d) {
        return d.value[__dim_field_value][val_field];
      };
    };

    function one_D_select_title(dim_field_value, val_field) {
      var __dim_field_value = dim_field_value;
      return function(d) {
        return __dim_field_value + '(t = ' + d.key + ') = ' + d3.format("0,.0f")(d.value[__dim_field_value][val_field]);
      };
    };

    // Order convention for the crossfilter 2-D dimension
    //   d.key[0] is the 'x' dimension of the stacked bar / line dc.js chart
    //   d.key[1] is the 'y' dimension, i.e. the 'stacked dimension' of the stacked bar / line dc.js chart
    function one_D_remove_empty_bins(source_group) {
      return {
        all: function() {
          return source_group.all().filter(function(d) {
            if (d.key[1] in d.value) {
              return d.value[d.key[1]]._count != 0;
            } else {
              return false;
            }
          });
        }
      };
    };

    /*
     ********************************************************************************
     * FOR UNIQUE DATASET DATABASE -- 2-D "dim series"
     *   >> from the database indexed by 'database_id'
     *   >> along the dim_field
     ********************************************************************************
     *   e.g. for 1-D SMALL MULTIPLES with 1-D "dim series" for stacked bar / line dc.js charts
     *     >> dim_field_1 is then the sm unique dimension
     *     >> dim_field_2 is then the 'stacked dimension' of the stacked bar / line dc.js chart
     *   e.g. for 2-D SMALL MULTIPLES with series dc.js charts
     *     >> dim_field_1 is then the sm row dimension
     *     >> dim_field_2 is then the sm col dimension
     ********************************************************************************
     */
    function unique_dataset_two_D_reduce_sum_add(database_id, dim_field_1, dim_field_2, val_field) {
      return function(p, v) {
        if ( (v[dim_field_1] != '') && (v[dim_field_2] != '')) {
          ++p[v[dim_field_1]][v[dim_field_2]]._count;
          p[v[dim_field_1]][v[dim_field_2]][val_field] += v[val_field];
        }
        return p;
      };
    };

    function unique_dataset_two_D_reduce_sum_remove(database_id, dim_field_1, dim_field_2, val_field) {
      return function(p, v) {
        if ( (v[dim_field_1] != '') && (v[dim_field_2] != '')) {
          --p[v[dim_field_1]][v[dim_field_2]]._count;
          p[v[dim_field_1]][v[dim_field_2]][val_field] -= v[val_field];
        }
        return p;
      };
    };

    function unique_dataset_two_D_reduce_sum_init(database_id, dim_field_1, dim_field_2, val_field) {
      return function() {
        var p = {};
        for (var dim_field_1_value in __DATABASE_REGISTRY[database_id].__dim_field_value_arrays[dim_field_1]) {
          p[dim_field_1_value] = {};
          for (var dim_field_2_value in __DATABASE_REGISTRY[database_id].__dim_field_value_arrays[dim_field_2]) {
            p[dim_field_1_value][dim_field_2_value] = {
              _count: 0
            };
            p[dim_field_1_value][dim_field_2_value][val_field] = 0;
          };
        };
        return p;
      };
    };

    /*
     ********************************************************************************
     * FOR SELECTED DATASET ONLY -- 2-D "dim series"
     *   >> from the database indexed by 'database_id'
     *   >> for the dataset labeled 'dataset_label'
     *   >> along the dim_field
     ********************************************************************************
     *   e.g. for 1-D SMALL MULTIPLES with 1-D "dim series" for stacked bar / line dc.js charts
     *     >> dim_field_1 is then the sm unique dimension
     *     >> dim_field_2 is then the 'stacked dimension' of the stacked bar / line dc.js chart
     *   e.g. for 2-D SMALL MULTIPLES with series dc.js charts
     *     >> dim_field_1 is then the sm row dimension
     *     >> dim_field_2 is then the sm col dimension
     ********************************************************************************
     */
    function selected_dataset_only_two_D_reduce_sum_add(database_id, dataset_label, dim_field_1, dim_field_2, val_field) {
      return function(p, v) {
        if (v._dataset == dataset_label) {
          ++p[v[dim_field_1]][v[dim_field_2]]._count;
          p[v[dim_field_1]][v[dim_field_2]][val_field] += v[val_field];
        }
        return p;
      };
    };

    function selected_dataset_only_two_D_reduce_sum_remove(database_id, dataset_label, dim_field_1, dim_field_2, val_field) {
      return function(p, v) {
        if (v._dataset == dataset_label) {
          --p[v[dim_field_1]][v[dim_field_2]]._count;
          p[v[dim_field_1]][v[dim_field_2]][val_field] -= v[val_field];
        }
        return p;
      };
    };

    function selected_dataset_only_two_D_reduce_sum_init(database_id, dataset_label, dim_field_1, dim_field_2, val_field) {
      return function() {
        var p = {};
        for (var dim_field_1_value in __DATABASE_REGISTRY[database_id].__dim_field_value_arrays[dataset_label][dim_field_1]) {
          p[dim_field_1_value] = {};
          for (var dim_field_2_value in __DATABASE_REGISTRY[database_id].__dim_field_value_arrays[dataset_label][dim_field_2]) {
            p[dim_field_1_value][dim_field_2_value] = {
              _count: 0
            };
            p[dim_field_1_value][dim_field_2_value][val_field] = 0;
          };
        };
        return p;
      };
    };

    /*
     ********************************************************************************
     * Utilities for 2-D "dim series"
     *   >> common for both (i) unique, clean dataset and (ii) multiple sub-datasets
     ********************************************************************************
     *   e.g. for 1-D SMALL MULTIPLES with 1-D "dim series" for stacked bar / line dc.js charts
     *     >> dim_field_1 is then the sm unique dimension
     *     >> dim_field_2 is then the 'stacked dimension' of the stacked bar / line dc.js chart
     ********************************************************************************
     */
    function two_D_select_stack(dim_field_1_value, dim_field_2_value, val_field) {
      var __dim_field_1_value = dim_field_1_value;
      var __dim_field_2_value = dim_field_2_value;
      return function(d) {
        return d.value[__dim_field_1_value][__dim_field_2_value][val_field];
      };
    };

    // Recall that dim_field_2 is then the 'stacked dimension' of the stacked bar / line dc.js chart
    function two_D_select_title(dim_field_1_value, dim_field_2_value, val_field) {
      var __dim_field_1_value = dim_field_1_value;
      var __dim_field_2_value = dim_field_2_value;
      return function(d) {
        return __dim_field_2_value + '(t = ' + d.key + ') = ' + d3.format("0,.0f")(d.value[__dim_field_1_value][__dim_field_2_value][val_field]);
      };
    };

    // Recall that dim_field_2 is then the 'stacked dimension' of the stacked bar / line dc.js chart
    // Order convention for the crossfilter 2-D dimension
    //   d.key[0] is the 'x' dimension of the stacked bar / line dc.js chart
    //   d.key[1] is the 'y' dimension, i.e. the 'stacked dimension' of the stacked bar / line dc.js chart
    function two_D_remove_empty_bins(source_group, dim_field_1_value) {
      return {
        all: function() {
          return source_group.all().filter(function(d) {
            if (dim_field_1_value in d.value) {
              if (d.key[1] in d.value[dim_field_1_value]) {
                return d.value[dim_field_1_value][d.key[1]]._count != 0;
              } else {
                return false;
              }
            } else {
              return false;
            }
          });
        }
      };
    };



    /*
     ************************************************************************************************************************
     ************************************************************************************************************************
     * UTILS for managing dc.js charts
     ************************************************************************************************************************
     ************************************************************************************************************************
     */


    /*
     ********************************************************************************
     * Maintain a registry of all known dc.js charts
     ********************************************************************************
     */
    // dictionary with 'dc_chart_id' as key
    var __DC_CHARTS_REGISTRY = {};
    // dictionary with 'crossfilter_dim_key' as key
    var __CROSSFILTER_REGISTRY_DIMENSIONS = {};
    // var __CROSSFILTER_REGISTRY_GROUPS = {};

    /**
     ********************************************************************************
     * Init the dc.js chart with an empty object
     ********************************************************************************
     */
    function dc_init_chart(arg) {
      var l_chart;
      // arg: (string)              dc_chart_id
      //      (string)              dc_chart_type
      //      (string)              dc_chart_group
      //      (string)              database_id
      //      (optional string)     dataset_label
      //      (crossfilter object)  crossfilter_ndx
      //      (optional string)     dim_field
      //      (optional string)     dim_x_field
      //      (optional string)     dim_y_field
      //      (optional string)     val_field
      //      (optional string)     val_x_field
      //      (optional string)     val_y_field
      //      (optional string)     val_r_field
      // console.log(arg.dc_chart_group);
      switch (arg.dc_chart_type) {
        case 'pie':
          l_chart = dc.pieChart(arg.dc_chart_id, arg.dc_chart_group);
          break;
        case 'row':
          l_chart = dc.rowChart(arg.dc_chart_id, arg.dc_chart_group);
          break;
        case 'bar':
          l_chart = dc.barChart(arg.dc_chart_id, arg.dc_chart_group);
          break;
        case 'line':
          l_chart = dc.lineChart(arg.dc_chart_id, arg.dc_chart_group);
          break;
        case 'series':
          l_chart = dc.seriesChart(arg.dc_chart_id, arg.dc_chart_group);
          break;
        case 'scatter':
          l_chart = dc.scatterChart(arg.dc_chart_id, arg.dc_chart_group);
          break;
        case 'bubble':
          l_chart = dc.bubbleChart(arg.dc_chart_id, arg.dc_chart_group);
          break;
        default:
          alert("The dc_chart_type '" + arg.dc_chart_type + "' is not yet supported by dvdf.js");
          break;
      }
      switch (arg.dc_chart_type) {
        case 'pie':
        case 'row':
          __DC_CHARTS_REGISTRY[arg.dc_chart_id] = {
            dc_chart:         l_chart,
            dc_chart_id:      arg.dc_chart_id,
            dc_chart_type:    arg.dc_chart_type,
            database_id:      arg.database_id,
            dataset_label:    arg.dataset_label, // undefined if unique dataset
            crossfilter_ndx:  arg.crossfilter_ndx,
            dim_field:        arg.dim_field,
            // dim_x_field:      arg.dim_x_field,
            // dim_y_field:      arg.dim_y_field,
            val_field:        arg.val_field,
            // val_x_field:      arg.val_x_field,
            // val_y_field:      arg.val_y_field,
            // val_r_field:      arg.val_r_field,
          };
          break;
        case 'bar':
        case 'line':
        case 'series':
          __DC_CHARTS_REGISTRY[arg.dc_chart_id] = {
            dc_chart:         l_chart,
            dc_chart_id:      arg.dc_chart_id,
            dc_chart_type:    arg.dc_chart_type,
            database_id:      arg.database_id,
            dataset_label:    arg.dataset_label, // undefined if unique dataset
            crossfilter_ndx:  arg.crossfilter_ndx,
            // dim_field:        arg.dim_field,
            dim_x_field:      arg.dim_x_field,
            dim_y_field:      arg.dim_y_field,
            val_field:        arg.val_field,
            // val_x_field:      arg.val_x_field,
            // val_y_field:      arg.val_y_field,
            // val_r_field:      arg.val_r_field,
          };
          break;
        case 'scatter':
          __DC_CHARTS_REGISTRY[arg.dc_chart_id] = {
            dc_chart:         l_chart,
            dc_chart_id:      arg.dc_chart_id,
            dc_chart_type:    arg.dc_chart_type,
            database_id:      arg.database_id,
            dataset_label:    arg.dataset_label, // undefined if unique dataset
            crossfilter_ndx:  arg.crossfilter_ndx,
            dim_field:        arg.dim_field,
            // dim_x_field:      arg.dim_x_field,
            // dim_y_field:      arg.dim_y_field,
            // val_field:        arg.val_field,
            val_x_field:      arg.val_x_field,
            val_y_field:      arg.val_y_field,
            // val_r_field:      arg.val_r_field,
          };
          break;
        case 'bubble':
          __DC_CHARTS_REGISTRY[arg.dc_chart_id] = {
            dc_chart:         l_chart,
            dc_chart_id:      arg.dc_chart_id,
            dc_chart_type:    arg.dc_chart_type,
            database_id:      arg.database_id,
            dataset_label:    arg.dataset_label, // undefined if unique dataset
            crossfilter_ndx:  arg.crossfilter_ndx,
            dim_field:        arg.dim_field,
            // dim_x_field:      arg.dim_x_field,
            // dim_y_field:      arg.dim_y_field,
            // val_field:        arg.val_field,
            val_x_field:      arg.val_x_field,
            val_y_field:      arg.val_y_field,
            val_r_field:      arg.val_r_field,
          };
          break;
        default:
          alert("The dc_chart_type '" + arg.dc_chart_type + "' is not yet supported by dvdf.js");
          break;
      }

      // enrich further
      switch (arg.dc_chart_type) {
        case 'pie':
        case 'row':
          __DC_CHARTS_REGISTRY[arg.dc_chart_id]['cf_dim_field'] = arg.dim_field;
          __DC_CHARTS_REGISTRY[arg.dc_chart_id]['cf_val_field'] = arg.val_field;
          break;
        case 'bar':
        case 'line':
          __DC_CHARTS_REGISTRY[arg.dc_chart_id]['cf_dim_field'] = arg.dim_x_field;
          __DC_CHARTS_REGISTRY[arg.dc_chart_id]['series_dim_field'] = arg.dim_y_field;
          __DC_CHARTS_REGISTRY[arg.dc_chart_id]['cf_val_field'] = arg.val_field;
          break;
        // 2D cf_dim_field_array
        case 'series':
          __DC_CHARTS_REGISTRY[arg.dc_chart_id]['cf_dim_field_array'] = [arg.dim_x_field, arg.dim_y_field];
          __DC_CHARTS_REGISTRY[arg.dc_chart_id]['cf_val_field'] = arg.val_field;
          break;
        // 2D cf_dim_field_array
        case 'scatter':
          __DC_CHARTS_REGISTRY[arg.dc_chart_id]['cf_dim_field_array'] = [arg.val_x_field, arg.dim_field];
          __DC_CHARTS_REGISTRY[arg.dc_chart_id]['cf_val_field'] = arg.val_y_field;
          break;
        case 'bubble':
          __DC_CHARTS_REGISTRY[arg.dc_chart_id]['cf_dim_field'] = arg.dim_field;
          __DC_CHARTS_REGISTRY[arg.dc_chart_id]['cf_val_field_array'] = [arg.val_y_field, arg.val_r_field];
          break;
        default:
          alert("The dc_chart_type '" + dc_chart_type + "' is not yet supported by dvdf.js");
          break;
      }

      return l_chart;
    };

    /**
     ********************************************************************************
     * Create new crossfilter dimension (if not already existing)
     ********************************************************************************
     */
    function _prv__dc_create_dim(dc_chart_id) {
      var l_enriched_dc_chart = __DC_CHARTS_REGISTRY[dc_chart_id];
/*
      var l_dim_key = {
        database_id:      l_enriched_dc_chart.database_id,
        crossfilter_ndx:  l_enriched_dc_chart.crossfilter_ndx,
        dim_field:        l_enriched_dc_chart.dim_field,
        dim_field_array:  l_enriched_dc_chart.dim_field_array,
      };
 */
      var l_dim_key;
      var l_dim;

      // build l_dim_key
      switch (l_enriched_dc_chart.dc_chart_type) {
        case 'pie':
        case 'row':
        case 'bubble':
/*
          l_dim_key = {
            database_id:      l_enriched_dc_chart.database_id,
            crossfilter_ndx:  l_enriched_dc_chart.crossfilter_ndx,
            dim_field:        l_enriched_dc_chart.cf_dim_field,
          };
// */
          l_dim_key =
            "database_id:"          + l_enriched_dc_chart.database_id
            + "$$$crossfilter_ndx:" + l_enriched_dc_chart.crossfilter_ndx
            + "$$$dim_field:"       + l_enriched_dc_chart.cf_dim_field
          ;
          break;
        case 'bar':
        case 'line':
/*
          l_dim_key = {
            database_id:      l_enriched_dc_chart.database_id,
            crossfilter_ndx:  l_enriched_dc_chart.crossfilter_ndx,
            dim_field:        l_enriched_dc_chart.cf_dim_field,
            series_dim_field: l_enriched_dc_chart.series_dim_field,
          };
// */
          l_dim_key =
            "database_id:"          + l_enriched_dc_chart.database_id
            + "$$$crossfilter_ndx:" + l_enriched_dc_chart.crossfilter_ndx
            + "$$$dim_field:"       + l_enriched_dc_chart.cf_dim_field
            + "$$$series_dim_field:"+ l_enriched_dc_chart.series_dim_field
          ;
          break;
        // 2D cf_dim_field_array
        case 'series':
        case 'scatter':
/*
          l_dim_key = {
            database_id:      l_enriched_dc_chart.database_id,
            crossfilter_ndx:  l_enriched_dc_chart.crossfilter_ndx,
            dim_field_array:  l_enriched_dc_chart.cf_dim_field_array,
          };
// */
          l_dim_key =
            "database_id:"          + l_enriched_dc_chart.database_id
            + "$$$crossfilter_ndx:" + l_enriched_dc_chart.crossfilter_ndx
            + "$$$dim_field_array:" + l_enriched_dc_chart.cf_dim_field_array
          ;
          break;
        default:
          alert("The dc_chart_type '" + dc_chart_type + "' is not yet supported by dvdf.js");
          break;
      }

      // build l_dim if not already existing
      if (!(l_dim_key in __CROSSFILTER_REGISTRY_DIMENSIONS)) {
        switch (l_enriched_dc_chart.dc_chart_type) {
          case 'pie':
          case 'row':
          case 'bar':
          case 'line':
          case 'bubble':
            l_dim = l_enriched_dc_chart.crossfilter_ndx.dimension(function(d) {
              return d[l_enriched_dc_chart.cf_dim_field];
            });
            break;
          // 2D cf_dim_field_array
          case 'series':
          case 'scatter':
            l_dim = l_enriched_dc_chart.crossfilter_ndx.dimension(function(d) {
              return [d[l_enriched_dc_chart.cf_dim_field_array[0]],
                      d[l_enriched_dc_chart.cf_dim_field_array[1]]];
            });
            break;
          default:
            alert("The dc_chart_type '" + dc_chart_type + "' is not yet supported by dvdf.js");
            break;
        }
        __CROSSFILTER_REGISTRY_DIMENSIONS[l_dim_key] = l_dim;
      } else {
        l_dim = __CROSSFILTER_REGISTRY_DIMENSIONS[l_dim_key];
      }
      __DC_CHARTS_REGISTRY[dc_chart_id]['crossfilter_dim_key'] = l_dim_key;
      __DC_CHARTS_REGISTRY[dc_chart_id]['crossfilter_dim'] = l_dim;
      return l_dim;
    };

    /**
     ********************************************************************************
     * Create new crossfilter group (for standard sum)
     * FOR UNIQUE DATASET DATABASE
     ********************************************************************************
     */
    function _prv__dc_unique_dataset_create_dim_gp(dc_chart_id) {
      var l_enriched_dc_chart = __DC_CHARTS_REGISTRY[dc_chart_id];
      var l_database_id = l_enriched_dc_chart.database_id;
      // l_dim_field may be undefined
      var l_dim_field = l_enriched_dc_chart.cf_dim_field;
      // l_series_dim_field may be undefined
      var l_series_dim_field = l_enriched_dc_chart.series_dim_field;
      // l_dim_field_array may be undefined
      var l_dim_field_array = l_enriched_dc_chart.cf_dim_field_array;
      var l_val_field = l_enriched_dc_chart.cf_val_field;

      var l_dim_key = l_enriched_dc_chart.crossfilter_dim_key;
      var l_dim = l_enriched_dc_chart.crossfilter_dim;
      var l_dim_gp;

      // build l_dim_gp
      switch (l_enriched_dc_chart.dc_chart_type) {
        case 'pie':
        case 'row':
          l_dim_gp = l_dim.group().reduce(
            non_blank_field_only_reduce_sum_add(
              l_dim_field, l_val_field),
            non_blank_field_only_reduce_sum_remove(
              l_dim_field, l_val_field),
            non_blank_field_only_reduce_sum_init(
              l_dim_field, l_val_field)
          );
          break;
        case 'bar':
        case 'line':
          l_dim_gp = l_dim.group().reduce(
            unique_dataset_one_D_reduce_sum_add(
              l_database_id, l_series_dim_field, l_val_field),
            unique_dataset_one_D_reduce_sum_remove(
              l_database_id, l_series_dim_field, l_val_field),
            unique_dataset_one_D_reduce_sum_init(
              l_database_id, l_series_dim_field, l_val_field)
          );
          break;
        case 'series':
        case 'scatter':
          l_dim_gp = l_dim.group().reduce(
            non_blank_field_array_only_reduce_sum_add(
              l_dim_field_array, l_val_field),
            non_blank_field_array_only_reduce_sum_remove(
              l_dim_field_array, l_val_field),
            non_blank_field_array_only_reduce_sum_init(
              l_dim_field_array, l_val_field)
          );
          break;
        case 'bubble':
          l_dim_gp = l_dim.group().reduce(
            non_blank_field_only_reduce_array_sum_add(
              l_dim_field, l_val_field_array),
            non_blank_field_only_reduce_array_sum_remove(
              l_dim_field, l_val_field_array),
            non_blank_field_only_reduce_array_sum_init(
              l_dim_field, l_val_field_array)
          );
          break;
        default:
          alert("The dc_chart_type '" + dc_chart_type + "' is not yet supported by dvdf.js");
          break;
      }
      __DC_CHARTS_REGISTRY[dc_chart_id]['crossfilter_dim_gp'] = l_dim_gp;
      return l_dim_gp;
    };

    /**
     * Create new crossfilter group (for standard sum)
     *   with an "aggregated" data file
     */
    function _prv__dc_create_dim_gp_with_agg_data_file(dc_chart_id) {
      var l_dim_gp = non_blank_field_only_remove_void_bin(_prv__dc_create_dim_gp(dc_chart_id), '');
      __DC_CHARTS_REGISTRY[dc_chart_id]['crossfilter_dim_gp'] = l_dim_gp;
      return l_dim_gp;
    };

    /**
     ********************************************************************************
     * Create new crossfilter group (for standard sum)
     * FOR SELECTED DATASET ONLY
     ********************************************************************************
     */
    function _prv__dc_selected_dataset_only_create_dim_gp(dc_chart_id) {
      var l_enriched_dc_chart = __DC_CHARTS_REGISTRY[dc_chart_id];
      var l_database_id = l_enriched_dc_chart.database_id;
      var l_dataset_label = l_enriched_dc_chart.dataset_label;
      // l_series_dim_field may be undefined
      var l_series_dim_field = l_enriched_dc_chart.series_dim_field;
      var l_val_field = l_enriched_dc_chart.cf_val_field;

      var l_dim_key = l_enriched_dc_chart.crossfilter_dim_key;
      var l_dim = l_enriched_dc_chart.crossfilter_dim;
      var l_dim_gp;

      // build l_dim_gp
      switch (l_enriched_dc_chart.dc_chart_type) {
        case 'pie':
        case 'row':
        case 'series':
        case 'scatter':
        case 'bubble':
          l_dim_gp = l_dim.group().reduce(
            selected_dataset_only_reduce_sum_add(
              l_dataset_label, l_val_field),
            selected_dataset_only_reduce_sum_remove(
              l_dataset_label, l_val_field),
            selected_dataset_only_reduce_sum_init(
              l_dataset_label, l_val_field)
          );
          break;
        case 'bar':
        case 'line':
          l_dim_gp = l_dim.group().reduce(
            selected_dataset_only_one_D_reduce_sum_add(
              l_database_id, l_dataset_label, l_series_dim_field, l_val_field),
            selected_dataset_only_one_D_reduce_sum_remove(
              l_database_id, l_dataset_label, l_series_dim_field, l_val_field),
            selected_dataset_only_one_D_reduce_sum_init(
              l_database_id, l_dataset_label, l_series_dim_field, l_val_field)
          );
          break;
        default:
          alert("The dc_chart_type '" + dc_chart_type + "' is not yet supported by dvdf.js");
          break;
      }
      __DC_CHARTS_REGISTRY[dc_chart_id]['crossfilter_dim_gp'] = l_dim_gp;
      return l_dim_gp;
    };

    /**
     ********************************************************************************
     * Set up the dc.js chart with the standard crossfilter dimension and group
     ********************************************************************************
     */
    function _prv__dc_setup_std_chart(dc_chart_id) {
      var l_enriched_dc_chart = __DC_CHARTS_REGISTRY[dc_chart_id];
//      console.log('l_enriched_dc_chart'); console.log(l_enriched_dc_chart);

      var l_chart = l_enriched_dc_chart.dc_chart;
      var l_chart_type = l_enriched_dc_chart.dc_chart_type;
      var l_database_id = l_enriched_dc_chart.database_id;
      // l_dataset_label may be undefined
      var l_dataset_label = l_enriched_dc_chart.dataset_label;

      var l_dim_field = l_enriched_dc_chart.cf_dim_field;
      var l_series_dim_field = l_enriched_dc_chart.series_dim_field;
      var l_val_field = l_enriched_dc_chart.cf_val_field;

      var l_dim = l_enriched_dc_chart.crossfilter_dim;
      var l_dim_gp = l_enriched_dc_chart.crossfilter_dim_gp;

      switch (l_chart_type) {
        case 'pie':
        case 'row':
          l_chart
            .dimension(l_dim)
            .group(l_dim_gp)
/*
            .keyAccessor(function(d) {
              return d.key;
            })
            .valueAccessor(function(d) {
              return d.value;
            })
 */
            .title(function(d) {
              return d.key + ': ' + d3.format("0,.0f")(d.value);
            })
          ;
          break;
        case 'bar':
        case 'line':
          l_chart
            .dimension(l_dim)
/*
            .keyAccessor(function(d) {
              return d.key;
            })
 */
          ;

          // works even if l_dataset_label is undefined
          var l_dim_field_value_arrays = get_dim_field_value_arrays(l_database_id, l_dataset_label);
          // if (l_dataset_label != undefined) l_dim_field_value_arrays = l_dim_field_value_arrays[l_dataset_label];
          var l_is_first_dim_field_value = true;

          for (var l_dim_field_value in l_dim_field_value_arrays[l_series_dim_field]) {
//            console.log('l_dim_field_value'); console.log(l_dim_field_value);
            if (l_is_first_dim_field_value) {
              l_chart
                .group(l_dim_gp,
                    l_dim_field_value,
                    one_D_select_stack(l_dim_field_value, l_val_field));
              l_is_first_dim_field_value = false;
            } else {
              l_chart
                .stack(l_dim_gp,
                    l_dim_field_value,
                    one_D_select_stack(l_dim_field_value, l_val_field));
            }
            l_chart
              .title(one_D_select_title(l_dim_field_value, l_val_field));
          }
          break;
        case 'series':
        case 'scatter':
          l_chart
            .dimension(l_dim)
            .group(l_dim_gp)
            .seriesAccessor(function(d) {
              return d.key[1];
            })
            .keyAccessor(function(d) {
              return d.key[0];
            })
            .valueAccessor(function(d) {
              return d.value;
            })
            .title(function(d) {
              return '(' + d.key[0] + ', ' + d.key[1] + ') = ' + d3.format("0,.0f")(d.value);
            })
          ;
          break;
        case 'bubble':
          break;
        default:
          alert("The dc_chart_type '" + l_chart_type + "' is not yet supported by dvdf.js");
          break;
      }
    };

    /**
     ********************************************************************************
     * Format the dc.js chart with "standard" formatting options
     ********************************************************************************
     */
    function _prv__dc_format_std_chart(dc_chart_id) {
      var l_enriched_dc_chart = __DC_CHARTS_REGISTRY[dc_chart_id];

      var l_chart = l_enriched_dc_chart.dc_chart;
      var l_chart_type = l_enriched_dc_chart.dc_chart_type;

      var ll_chart_type = l_chart_type;
      if (__DC_CHART_PARAMETERS != {}) {
        if (!(l_chart_type in __DC_CHART_PARAMETERS)) {
          ll_chart_type = "default";
        }
        l_chart
/*
          .width(__DC_CHART_PARAMETERS[ll_chart_type].width)
          .height(__DC_CHART_PARAMETERS[ll_chart_type].height)
          .width(768)
          .height(480)
          .width(480)
          .height(250)
 */
          .width(600)
          .height(300)
        ;
      }
      switch (l_chart_type) {
        case 'pie':
        case 'row':
          l_chart
            // .renderArea(true)
            // .brushOn(false)
            // .mouseZoomable(true)
            .renderLabel(true)
          ;
          break;
        case 'line':
          l_chart
            .renderArea(true)
          ;
        case 'bar':
          // l_chart
          //   .hidableStacks(true)
          // ;
        case 'series':
          l_chart
            // .renderArea(true)
            // .brushOn(false)
            .brushOn(true)
            .mouseZoomable(true)
            .renderLabel(true)
          ;
          l_chart
            // .x(d3.scale.ordinal())
            // .xUnits(dc.units.ordinal)
            .yAxis().tickFormat(function(d) {
              return d3.format(',d')(d);
            })
          ;
          break;
        case 'scatter':
          break;
        case 'bubble':
          break;
        default:
          alert("The dc_chart_type '" + arg.dc_chart_type + "' is not yet supported by dvdf.js");
          break;
      }
      l_chart
        .legend(dc.legend().x(350).y(350).itemHeight(13).gap(5).horizontal(1).legendWidth(140).itemWidth(70));
      ;
    };

/*
      switch (arg.dc_chart_type) {
        case 'pie':
          break;
        case 'row':
          break;
        case 'bar':
          break;
        case 'line':
          break;
        case 'series':
          break;
        case 'scatter':
          break;
        case 'bubble':
          break;
        default:
          alert("The dc_chart_type '" + arg.dc_chart_type + "' is not yet supported by dvdf.js");
          break;
      }
 */

    /**
     ********************************************************************************
     * Proceed to the full setup of the dc.js chart
     *   with default formatting options
     * FOR UNIQUE DATASET DATABASE
     ********************************************************************************
     */
    function dc_chart_unique_dataset_full_std_setup(dc_chart_id) {

      // __DC_CHARTS_REGISTRY[dc_chart_id].crossfilter_ndx = crossfilter_ndx;

      // define crossfilter dimension
      var l_dim = _prv__dc_create_dim(dc_chart_id);

      // define crossfilter dimension group
      var l_dim_gp = _prv__dc_unique_dataset_create_dim_gp(dc_chart_id);

      _prv__dc_setup_std_chart(dc_chart_id);

      _prv__dc_format_std_chart(dc_chart_id);

    };

    /**
     ********************************************************************************
     * Proceed to the full setup of the dc.js chart
     *   with default formatting options
     * FOR SELECTED DATASET ONLY
     ********************************************************************************
     */
    function dc_chart_selected_dataset_only_full_std_setup(dc_chart_id) {

      // __DC_CHARTS_REGISTRY[dc_chart_id].crossfilter_ndx = crossfilter_ndx;

      // define crossfilter dimension
      var l_dim = _prv__dc_create_dim(dc_chart_id);

      // define crossfilter dimension group
      var l_dim_gp = _prv__dc_selected_dataset_only_create_dim_gp(dc_chart_id);

      _prv__dc_setup_std_chart(dc_chart_id);

      _prv__dc_format_std_chart(dc_chart_id);

    };



/*
 ************************************************************************************************************************
 ************************************************************************************************************************
 * UTILS for access to dvdf internal registries
 ************************************************************************************************************************
 ************************************************************************************************************************
 */
    function get_DATABASE_REGISTRY() {
      return __DATABASE_REGISTRY;
    };
    function get_DC_CHARTS_REGISTRY() {
      return __DC_CHARTS_REGISTRY;
    };
    function get_CROSSFILTER_REGISTRY_DIMENSIONS() {
      return __CROSSFILTER_REGISTRY_DIMENSIONS;
    };



   // dvdf_dc_utils
    return {
//  UTILS for managing dc_chart_parameters
      load_dc_chart_parameters_tsv:         load_dc_chart_parameters_tsv,
      unique_dataset_init_preprocessing:    unique_dataset_init_preprocessing,
      unique_dataset_process_data:          unique_dataset_process_data,
      multiple_datasets_init_preprocessing: multiple_datasets_init_preprocessing,
      multiple_datasets_process_data:       multiple_datasets_process_data,
      get_dim_field_value_arrays:           get_dim_field_value_arrays,
      get_val_field_stat_arrays:            get_val_field_stat_arrays,

//  UTILS for managing crossfilter dimensions and groups
      remove_empty_bins:  remove_empty_bins,
/*
  //  CONSTANT series
      constant_reduce_add:    constant_reduce_add,
      constant_reduce_remove: constant_reduce_remove,
      constant_reduce_init:   constant_reduce_init,
// */
  //  FOR UNIQUE DATASET DATABASE -- Standard sums for non-blank field only
      non_blank_field_only_reduce_sum_add:           non_blank_field_only_reduce_sum_add,
      non_blank_field_only_reduce_sum_remove:         non_blank_field_only_reduce_sum_remove,
      non_blank_field_only_reduce_sum_init:           non_blank_field_only_reduce_sum_init,
      non_blank_field_only_remove_void_bin:           non_blank_field_only_remove_void_bin,
  //  FOR UNIQUE DATASET DATABASE -- Standard sums for non-blank field array only
      non_blank_field_array_only_reduce_sum_add:      non_blank_field_array_only_reduce_sum_add,
      non_blank_field_array_only_reduce_sum_remove:   non_blank_field_array_only_reduce_sum_remove,
      non_blank_field_array_only_reduce_sum_init:     non_blank_field_array_only_reduce_sum_init,
      non_blank_field_array_only_remove_void_bin:     non_blank_field_array_only_remove_void_bin,
/*
  //  Standard sums for non-blank field only - val_field_array
      non_blank_field_only_reduce_array_add:      non_blank_field_only_reduce_array_add,
      non_blank_field_only_reduce_array_remove:   non_blank_field_only_reduce_array_remove,
      non_blank_field_only_reduce_array_init:     non_blank_field_only_reduce_array_init,
      non_blank_field_only_remove_array_void_bin: non_blank_field_only_remove_array_void_bin,
  //  Standard sums for rows with other fields blank
      other_fields_blank_reduce_add:      other_fields_blank_reduce_add,
      other_fields_blank_reduce_remove:   other_fields_blank_reduce_remove,
      other_fields_blank_reduce_init:     other_fields_blank_reduce_init,
      other_fields_blank_remove_void_bin: other_fields_blank_remove_void_bin,
// */
  //  FOR SELECTED DATASET ONLY -- Standard sums
      selected_dataset_only_reduce_sum_add:           selected_dataset_only_reduce_sum_add,
      selected_dataset_only_reduce_sum_remove:        selected_dataset_only_reduce_sum_remove,
      selected_dataset_only_reduce_sum_init:          selected_dataset_only_reduce_sum_init,
  //  FOR SELECTED DATASET ONLY -- Standard sums - for an array of value fields
      selected_dataset_only_reduce_array_sum_add:     selected_dataset_only_reduce_array_sum_add,
      selected_dataset_only_reduce_array_sum_remove:  selected_dataset_only_reduce_array_sum_remove,
      selected_dataset_only_reduce_array_sum_init:    selected_dataset_only_reduce_array_sum_init,
  //  1-D "dim series" for stacked bar / line dc.js charts
    //  FOR UNIQUE DATASET DATABASE -- 1-D "dim series" for stacked bar / line dc.js charts
      unique_dataset_one_D_reduce_sum_add:            unique_dataset_one_D_reduce_sum_add,
      unique_dataset_one_D_reduce_sum_remove:         unique_dataset_one_D_reduce_sum_remove,
      unique_dataset_one_D_reduce_sum_init:           unique_dataset_one_D_reduce_sum_init,
    //  FOR SELECTED DATASET ONLY -- 1-D "dim series" for stacked bar / line dc.js charts
      selected_dataset_only_one_D_reduce_sum_add:     selected_dataset_only_one_D_reduce_sum_add,
      selected_dataset_only_one_D_reduce_sum_remove:  selected_dataset_only_one_D_reduce_sum_remove,
      selected_dataset_only_one_D_reduce_sum_init:    selected_dataset_only_one_D_reduce_sum_init,
    //  Utilities for 1-D "dim series" for stacked bar / line dc.js charts
    //    >> common for both (i) unique, clean dataset and (ii) multiple sub-datasets
      one_D_select_stack:                             one_D_select_stack,
      one_D_select_title:                             one_D_select_title,
      one_D_remove_empty_bins:                        one_D_remove_empty_bins,
  //  2-D "dim series"
  //    e.g. for 1-D SMALL MULTIPLES with 1-D "dim series" for stacked bar / line dc.js charts
  //    e.g. for 2-D SMALL MULTIPLES with series dc.js charts
    //  FOR UNIQUE DATASET DATABASE -- 2-D "dim series"
      unique_dataset_two_D_reduce_sum_add:            unique_dataset_two_D_reduce_sum_add,
      unique_dataset_two_D_reduce_sum_remove:         unique_dataset_two_D_reduce_sum_remove,
      unique_dataset_two_D_reduce_sum_init:           unique_dataset_two_D_reduce_sum_init,
    //  FOR SELECTED DATASET ONLY -- 2-D "dim series"
      selected_dataset_only_two_D_reduce_sum_add:     selected_dataset_only_two_D_reduce_sum_add,
      selected_dataset_only_two_D_reduce_sum_remove:  selected_dataset_only_two_D_reduce_sum_remove,
      selected_dataset_only_two_D_reduce_sum_init:    selected_dataset_only_two_D_reduce_sum_init,
    //  Utilities for 2-D "dim series"
    //    >> common for both (i) unique, clean dataset and (ii) multiple sub-datasets
      two_D_select_stack:                             two_D_select_stack,
      two_D_select_title:                             two_D_select_title,
      two_D_remove_empty_bins:                        two_D_remove_empty_bins,

  //  UTILS for managing dc.js charts
      dc_init_chart:                                  dc_init_chart,
/*
      _prv__dc_create_dim:                            _prv__dc_create_dim,
      _prv__dc_unique_dataset_create_dim_gp:          _prv__dc_unique_dataset_create_dim_gp,
      _prv__dc_selected_dataset_only_create_dim_gp:   _prv__dc_selected_dataset_only_create_dim_gp,
      _prv__dc_setup_std_chart:                       _prv__dc_setup_std_chart,
      _prv__dc_format_std_chart:                      _prv__dc_format_std_chart,
// */

      dc_chart_unique_dataset_full_std_setup:         dc_chart_unique_dataset_full_std_setup,
      dc_chart_selected_dataset_only_full_std_setup:  dc_chart_selected_dataset_only_full_std_setup,

  //  UTILS for access to dvdf internal registries
      get_DATABASE_REGISTRY:                get_DATABASE_REGISTRY,
      get_DC_CHARTS_REGISTRY:               get_DC_CHARTS_REGISTRY,
      get_CROSSFILTER_REGISTRY_DIMENSIONS:  get_CROSSFILTER_REGISTRY_DIMENSIONS,
    }

  })();



  // dvdf
  return {
    timer: {
      utils: dvdf_timer_utils,
    },
    dc: {
      utils: dvdf_dc_utils,
    },
  }

})();

// console.log('dvdf'); console.log(dvdf);