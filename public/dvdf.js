/*
 ****************************************************************************************************************************************************************
 ****************************************************************************************************************************************************************
 * Data Visualisation & Dashboard Factory
 * v0.1a-0.0.3 (alpha version)
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
//    var __TIMESTAMPING_ON = false;
		var __TIMESTAMPING_CONSOLE_LOG = false;
		// logging timestamping in files may be added in the future
//    var __TIMESTAMPING_FILE_LOG = false;

		var __time_beg = 0;
		var __time_med = 0;
		var __time_end = 0;

		function timer_init_console_log(true_or_false) {
			__TIMESTAMPING_CONSOLE_LOG = true_or_false;
		};
		function timer_start(message) {
			if (__TIMESTAMPING_CONSOLE_LOG) {
				__time_beg = new Date();
				__time_end = __time_beg;
				console.log(__time_end.toLocaleString() + ': ' + message);
				return __time_end;
			}
		};
		function timer_lap(message) {
			if (__TIMESTAMPING_CONSOLE_LOG) {
				__time_med = __time_end;
				__time_end = new Date();
				console.log(__time_end.toLocaleString() + ': ' + message);
/*
				console.log('The last step took ' + ((__time_end.getTime() - __time_med.getTime()) / 1e3) + ' seconds.');
				console.log('\tThe entire step took so far ' + ((__time_end.getTime() - __time_beg.getTime()) / 1e3) + ' seconds.');
// */
				console.log('\tLast step: ' + ((__time_end.getTime() - __time_med.getTime()) / 1e3) + ' s.'
					+ '\tEntire step so far: ' + ((__time_end.getTime() - __time_beg.getTime()) / 1e3) + ' s.');
				return __time_end;
			}
		};
		function timer_stop(message) {
			timer_lap(message);
/*
			if (__TIMESTAMPING_CONSOLE_LOG) {
				__time_med = __time_end;
				__time_end = new Date();
				console.log(__time_end.toLocaleString() + ': ' + message);
				console.log('The last step took ' + ((__time_end.getTime() - __time_med.getTime()) / 1e3) + ' seconds.');
				console.log('\tThe entire process took in total ' + ((__time_end.getTime() - __time_beg.getTime()) / 1e3) + ' seconds.');
				return __time_end;
			}
// */
		};

		// dvdf_timer_utils
		return {
//  UTILS for timestamping logs
			init_console_log: timer_init_console_log,
			start: timer_start,
			lap: timer_lap,
			stop: timer_stop

//      dummy: {} // used to avoid syntax errors with trailing ','
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
			d3.tsv(tsv_file, function(dc_chart_parameters_tsv) {
				__DC_CHART_PARAMETERS["default"] = {};
				__DC_CHART_PARAMETERS["series"] = {};

				dc_chart_parameters_tsv.forEach(function (attr_row) {
					__DC_CHART_PARAMETERS["default"][attr_row.attribute] = attr_row.default;
					__DC_CHART_PARAMETERS["series"][attr_row.attribute] = (attr_row.series == "-") ? attr_row.default : attr_row.series;
				});
			});
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
		var __DATABASE_REGISTRY = {};

		function init_preprocessing(database_id, time_field, dim_field_array, val_field_array) {
			__DATABASE_REGISTRY[database_id] = {
				__TIME_DIM_NAME:  time_field,
				__DIM_FIELD_ARRAY:  dim_field_array,
				__VAL_FIELD_ARRAY:  val_field_array,
/*
 ********************************************************************************
 * Dimension fields : list of values
 * 2-D array
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
 * 1-D array
 *   >> val_field_stat_arrays[val_field_name] contains a JSON
 *        with the useful stats for the value 'val_field_name' (e.g. max, min)
 ********************************************************************************
 */
				__val_field_stat_arrays:  {},
			}

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
		function process_data(database_id, d) {
			__DATABASE_REGISTRY[database_id].__DIM_FIELD_ARRAY.forEach(function(dim_field_name) {
				if (!(d[dim_field_name] in __DATABASE_REGISTRY[database_id].__dim_field_value_arrays[dim_field_name])) {
					__DATABASE_REGISTRY[database_id].__dim_field_value_arrays[dim_field_name][d[dim_field_name]] = 0;
				}
				++__DATABASE_REGISTRY[database_id].__dim_field_value_arrays[dim_field_name][d[dim_field_name]];
			});
			__DATABASE_REGISTRY[database_id].__VAL_FIELD_ARRAY.forEach(function(val_field_name) {
				__DATABASE_REGISTRY[database_id].__val_field_stat_arrays[val_field_name]["_min"]
					= Math.min(d[val_field_name], __DATABASE_REGISTRY[database_id].__val_field_stat_arrays[val_field_name]["_min"]);
				__DATABASE_REGISTRY[database_id].__val_field_stat_arrays[val_field_name]["_max"]
					= Math.max(d[val_field_name], __DATABASE_REGISTRY[database_id].__val_field_stat_arrays[val_field_name]["_max"]);
			});
		};
		function get_dim_field_value_arrays(database_id) {
			return __DATABASE_REGISTRY[database_id].__dim_field_value_arrays;
		};
		function get_val_field_stat_arrays(database_id) {
			return __DATABASE_REGISTRY[database_id].__val_field_stat_arrays;
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
				all:function () {
					return source_group.all().filter(function(d) {
						return d.value != 0;
					});
				}
			};
		};

/*
 ********************************************************************************
 * CONSTANT series
 ********************************************************************************
 */

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

/*
 ********************************************************************************
 * Standard sums for non-blank field only
 ********************************************************************************
 */

		function non_blank_field_only_reduce_add(dim_field, val_field) {
			return function(p, v) {
				if (v[dim_field] != '') {
					p += v[val_field];
				}
				return p;
			};
		};
		function non_blank_field_only_reduce_remove(dim_field, val_field) {
			return function(p, v) {
				if (v[dim_field] != '') {
					p -= v[val_field];
				}
				return p;
			};
		};
		function non_blank_field_only_reduce_init(dim_field, val_field) {
			return function() {
				return 0;
			};
		};
		function non_blank_field_only_remove_void_bin(source_group, dim_field) {
			return {
				all:function () {
					return source_group.all().filter(function(d) {
						return d.key != "";
					});
				}
			};
		};

/*
 ********************************************************************************
 * Standard sums for rows with other fields blank
 ********************************************************************************
 */

		function other_fields_blank_reduce_add(other_dim_field_array, val_field) {
			return function(p, v) {
				var l_valid_record = true;
				other_dim_field_array.forEach(function(other_dim_field) {
					if (v[other_dim_field] != '') l_valid_record = false;
				})
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
				})
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
				all:function () {
					return source_group.all().filter(function(d) {
						return d.key != "";
					});
				}
			};
		};

/*
 ********************************************************************************
 * 1-D time series
 *   >> from the database indexed by 'database_id'
 *   >> along the dim_field
 ********************************************************************************
 */
		function one_D_reduce_add(database_id, dim_field, val_field) {
			return function(p, v) {
				if (v[dim_field] != "") {
					++p[v[dim_field]]._count;
					p[v[dim_field]][val_field] += v[val_field];
				}
				return p;
			};
		};
		function one_D_reduce_remove(database_id, dim_field, val_field) {
			return function(p, v) {
				if (v[dim_field] != "") {
					--p[v[dim_field]]._count;
					p[v[dim_field]][val_field] -= v[val_field];
				}
				return p;
			};
		};
		function one_D_reduce_init(database_id, dim_field, val_field) {
			return function() {
				var p = {};

				for (var dim_field_value in __DATABASE_REGISTRY[database_id].__dim_field_value_arrays[dim_field]) {
					p[dim_field_value] = { _count: 0 };
					p[dim_field_value][val_field] = 0;
				};
				return p;
			};
		};

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
		function one_D_remove_empty_bins(source_group, val_field_array) {
			return {
				all:function () {
					return source_group.all().filter(function(d) {
						if (d.key[1] in d.value) {
							return d.value[d.key[1]]._count != 0;
						}
						else {
							return false;
						}
					});
				}
			};
		};

/*
 ********************************************************************************
 * 1-D time series
 ********************************************************************************
 */
		function one_D_other_fields_blank_reduce_add(database_id, dim_field, other_dim_field_array, val_field) {
			return function(p, v) {
				var l_valid_record = true;
				other_dim_field_array.forEach(function(other_dim_field) {
					if (v[other_dim_field] != '') l_valid_record = false;
				})
				if (l_valid_record) {
					++p[v[dim_field]]._count;
					p[v[dim_field]][val_field] += v[val_field];
				}
//        console.log(v); console.log(p);
				return p;
			};
		};
		function one_D_other_fields_blank_reduce_remove(database_id, dim_field, other_dim_field_array, val_field) {
			return function(p, v) {
				var l_valid_record = true;
				other_dim_field_array.forEach(function(other_dim_field) {
					if (v[other_dim_field] != '') l_valid_record = false;
				})
				if (l_valid_record) {
					--p[v[dim_field]]._count;
					p[v[dim_field]][val_field] -= v[val_field];
				}
				return p;
			};
		};
		function one_D_other_fields_blank_reduce_init(database_id, dim_field, other_dim_field_array, val_field) {
			return function() {
				var p = {};

				for (var dim_field_value in __DATABASE_REGISTRY[database_id].__dim_field_value_arrays[dim_field]) {
					p[dim_field_value] = { _count: 0 };
					p[dim_field_value][val_field] = 0;
				};
				return p;
			};
		};

/*
 ********************************************************************************
 * 1-D SMALL MULTIPLES with 1-D time series
 ********************************************************************************
 */
		// !!! dim_field, val_field_array need to be immutable !!!
		// !!! IDX__ROW_ATTR_VALUE__INDICATOR_MATRIX, IDX__COL_ATTR_VALUE__INDICATOR_MATRIX need to be immutable !!!
		function sm_1D_reduce_add(dim_field, val_field_array,
									idx_row, idx_col, attr_name, IDX__ATTR_VALUE__INDICATOR_BOOLEAN_FUNCTION
									) {
			var _IDX_ROW = idx_row;
			var _IDX_COL = idx_col;
			var _ATTR_NAME = attr_name;
			return function(p, v) {
				if (IDX__ATTR_VALUE__INDICATOR_BOOLEAN_FUNCTION(_IDX_ROW, _IDX_COL, v[_ATTR_NAME])) {

					// initialize the val_fields array for this new value of the dim field
					if (!(v[dim_field] in p)) {
						p[v[dim_field]] = { _count: 0 };
						val_field_array.forEach(function(val_field) {
							p[v[dim_field]][val_field] = 0;
						});
					}
					// update the val_fields array
					++p[v[dim_field]]._count;
					val_field_array.forEach(function(val_field) {
						p[v[dim_field]][val_field] +=v[val_field];
					});
				}
				return p;
			};
		};
		function sm_1D_reduce_remove(dim_field, val_field_array,
									idx_row, idx_col, attr_name, IDX__ATTR_VALUE__INDICATOR_BOOLEAN_FUNCTION
									) {
			var _IDX_ROW = idx_row;
			var _IDX_COL = idx_col;
			var _ATTR_NAME = attr_name;
			return function(p, v) {
				if (IDX__ATTR_VALUE__INDICATOR_BOOLEAN_FUNCTION(_IDX_ROW, _IDX_COL, v[_ATTR_NAME])) {

					// initialize the val_fields array for this new value of the dim field
					if (!(v[dim_field] in p)) {
						p[v[dim_field]] = { _count: 0 };
						val_field_array.forEach(function(val_field) {
							p[v[dim_field]][val_field] = 0;
						});
					}
					// update the val_fields array
					--p[v[dim_field]]._count;
					val_field_array.forEach(function(val_field) {
						p[v[dim_field]][val_field] -=v[val_field];
					});
				}
				return p;
			};
		};
		function sm_1D_reduce_init(dim_field, val_field_array) {
			return function() {
				return {};
			};
		};
		function sm_1D_remove_empty_bins(source_group, val_field_array) {
			return {
				all:function () {
					return source_group.all().filter(function(d) {
						if (d.key[1] in d.value) {
							return d.value[d.key[1]]._count != 0;
						}
						else {
							return false;
						}
					});
				}
			};
		};
/*
// */



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
		var __DC_CHARTS_REGISTRY = {};

		function dc_create_chart(arg) {
			var l_chart = '';
			// arg: dc_chart_id, dc_chart_type
			switch (arg.dc_chart_type) {
				case "series":
					l_chart = dc.seriesChart(arg.dc_chart_id);
					break;
				case "line":
					l_chart = dc.lineChart(arg.dc_chart_id);
					break;
				case "bar":
					l_chart = dc.barChart(arg.dc_chart_id);
					break;
				default:
					break;
			}
			__DC_CHARTS_REGISTRY[arg.dc_chart_id] = l_chart;
//      console.log(__DC_CHARTS_REGISTRY);
			return l_chart;
		};

		function dc_create_dim(arg) {
			// arg: crossfilter_ndx, dc_chart_type,
			//    database_id,
			//    dim_field
			// //   TIME_DIM_NAME, DIM_FIELD_NAMES
			var l_database = __DATABASE_REGISTRY[arg.database_id];
			switch (arg.dc_chart_type) {
				case "series":
					return arg.crossfilter_ndx.dimension(function(d) {
						var _return_array = [ d[l_database.__TIME_DIM_NAME] ];
						_return_array.push(d[arg.dim_field])
						return _return_array;
					});
				case "bar":
				case "line":
					return arg.crossfilter_ndx.dimension(function(d) {
						return d[l_database.__TIME_DIM_NAME];
					});
				default:
					return '';
			}
		};

		function dc_create_group(arg) {
			// arg: dc_dim, dc_chart_type,
			//    database_id,
			//    dim_field, val_field
			switch (arg.dc_chart_type) {
				case "series":
					return arg.dc_dim.group().reduceSum(function(d) {
						return d[arg.val_field];
					});
				case "bar":
				case "line":
					return arg.dc_dim.group().reduce(
						one_D_reduce_add(arg.database_id, arg.dim_field, arg.val_field),
						one_D_reduce_remove(arg.database_id, arg.dim_field, arg.val_field),
						one_D_reduce_init(arg.database_id, arg.dim_field, arg.val_field)
					);
				default:
					return '';
			}
		};

		function dc_create_group_other_fields_blank(arg) {
			// arg: dc_dim, dc_chart_type,
			//    database_id,
			//    dim_field, other_dim_field_array, val_field
			switch (arg.dc_chart_type) {
				case "series":
					return other_fields_blank_remove_void_bin(
						arg.dc_dim.group().reduce(
							other_fields_blank_reduce_add(arg.other_dim_field_array, arg.val_field),
							other_fields_blank_reduce_remove(arg.other_dim_field_array, arg.val_field),
							other_fields_blank_reduce_init(arg.other_dim_field_array, arg.val_field)
						), arg.other_dim_field_array
					);
				case "bar":
				case "line":
					return arg.dc_dim.group().reduce(
						one_D_other_fields_blank_reduce_add(arg.database_id, arg.dim_field, arg.other_dim_field_array, arg.val_field),
						one_D_other_fields_blank_reduce_remove(arg.database_id, arg.dim_field, arg.other_dim_field_array, arg.val_field),
						one_D_other_fields_blank_reduce_init(arg.database_id, arg.dim_field, arg.other_dim_field_array, arg.val_field)
					);
				default:
					return '';
			}
		};

		function dc_setup_chart(arg) {
			// arg: chart, dc_chart_type,
			//    database_id,
			//    dc_dimension, dc_group,
			//    dim_field, val_field
			switch (arg.dc_chart_type) {
				case "series":
					arg.chart
						.dimension(arg.dc_dimension)
						.group(arg.dc_group)
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
							return d.key[1] + ' (t = ' + d.key[0] + ') = ' + d3.format("0,.0f")(d.value);
						})
					;
					break;
				case "bar":
				case "line":
					arg.chart
						.dimension(arg.dc_dimension)
						.keyAccessor(function(d) {
							return d.key;
						})
					;

					var __dim_field_value_arrays = get_dim_field_value_arrays(arg.database_id);
				var __is_first_dim_field_value = true;

					for (var __dim_field_value in __dim_field_value_arrays[arg.dim_field]) {
						if (__is_first_dim_field_value) {
							arg.chart
								.group(arg.dc_group,
										__dim_field_value,
										one_D_select_stack(__dim_field_value, arg.val_field));
							__is_first_dim_field_value = false;
						} else {
							arg.chart
								.stack(arg.dc_group,
										__dim_field_value,
										one_D_select_stack(__dim_field_value, arg.val_field));
						}
						arg.chart
							.title(one_D_select_title(__dim_field_value, arg.val_field));
					}
					break;
				default:
					break;
			}
		};

		function dc_format_chart(arg) {
			// arg: chart, dc_chart_type)
			var l_chart_type = arg.dc_chart_type;
			if (!(arg.dc_chart_type in __DC_CHART_PARAMETERS)) {
				l_chart_type = "default";
			}
			arg.chart
				.width(__DC_CHART_PARAMETERS[l_chart_type].width)
				.height(__DC_CHART_PARAMETERS[l_chart_type].height)
				.brushOn(false)
				.mouseZoomable(true)
				.legend(dc.legend().x(350).y(350).itemHeight(13).gap(5).horizontal(1).legendWidth(140).itemWidth(70));
			;
			switch (arg.dc_chart_type) {
				case "series":
					break;
				case "bar":
					arg.chart
						.renderLabel(true)
					;
					break;
				case "line":
					arg.chart
						.renderArea(true)
						.renderLabel(true)
					;
					break;
				default:
					break;
			}
		};

		function dc_make_chart_with_data(arg) {
			// arg: dc_chart_id, dc_chart_type
			//    database_id,
			//    crossfilter_ndx,
			//    dim_field, val_field
			var l_dim = dc_create_dim({
				crossfilter_ndx: arg.crossfilter_ndx,
				dc_chart_type: arg.dc_chart_type,
				database_id: arg.database_id,
				dim_field: arg.dim_field
			});
			var l_group = dc_create_group({
				dc_dim: l_dim,
				dc_chart_type: __CHART_TYPE,
				database_id: arg.database_id,
				dim_field: arg.dim_field,
				val_field: arg.val_field
			});
			dc_setup_chart({
				chart: __DC_CHARTS_REGISTRY[arg.dc_chart_id],
				dc_chart_type: arg.dc_chart_type,
				database_id: arg.database_id,
				dc_dimension: l_dim,
				dc_group: l_group,
				dim_field: arg.dim_field,
				val_field: arg.val_field
			});
			dc_format_chart({
				chart: __DC_CHARTS_REGISTRY[arg.dc_chart_id],
				dc_chart_type: arg.dc_chart_type
			});
		};


		// dvdf_dc_utils
		return {
//  UTILS for managing dc_chart_parameters
			load_dc_chart_parameters_tsv: load_dc_chart_parameters_tsv,
			init_preprocessing: init_preprocessing,
			process_data: process_data,
			get_dim_field_value_arrays: get_dim_field_value_arrays,
			get_val_field_stat_arrays:  get_val_field_stat_arrays,

//  UTILS for managing crossfilter dimensions and groups
			remove_empty_bins:    remove_empty_bins,
	//  CONSTANT series
			constant_reduce_add:  constant_reduce_add,
			constant_reduce_remove: constant_reduce_remove,
			constant_reduce_init: constant_reduce_init,
	//  Standard sums for non-blank field only
			non_blank_field_only_reduce_add:    non_blank_field_only_reduce_add,
			non_blank_field_only_reduce_remove: non_blank_field_only_reduce_remove,
			non_blank_field_only_reduce_init:   non_blank_field_only_reduce_init,
			non_blank_field_only_remove_void_bin: non_blank_field_only_remove_void_bin,
	//  Standard sums for rows with other fields blank
			other_fields_blank_reduce_add:    other_fields_blank_reduce_add,
			other_fields_blank_reduce_remove: other_fields_blank_reduce_remove,
			other_fields_blank_reduce_init:   other_fields_blank_reduce_init,
			other_fields_blank_remove_void_bin: other_fields_blank_remove_void_bin,
	//  1-D time series
			one_D_reduce_add:     one_D_reduce_add,
			one_D_reduce_remove:    one_D_reduce_remove,
			one_D_reduce_init:      one_D_reduce_init,
			one_D_select_stack:     one_D_select_stack,
			one_D_select_title:     one_D_select_title,
			one_D_remove_empty_bins:  one_D_remove_empty_bins,
	//  1-D time series
			one_D_other_fields_blank_reduce_add:    one_D_other_fields_blank_reduce_add,
			one_D_other_fields_blank_reduce_remove:   one_D_other_fields_blank_reduce_remove,
			one_D_other_fields_blank_reduce_init:   one_D_other_fields_blank_reduce_init,
	//  1-D SMALL MULTIPLES with 1-D time series
			sm_1D_reduce_add:     sm_1D_reduce_add,
			sm_1D_reduce_remove:    sm_1D_reduce_remove,
			sm_1D_reduce_init:      sm_1D_reduce_init,
			sm_1D_remove_empty_bins:  sm_1D_remove_empty_bins,
	//  UTILS for managing dc.js charts
			dc_create_chart:          dc_create_chart,
			dc_create_dim:            dc_create_dim,
			dc_create_group:          dc_create_group,
			dc_create_group_other_fields_blank: dc_create_group_other_fields_blank,
			dc_format_chart:          dc_format_chart,
			dc_setup_chart:           dc_setup_chart,

			dc_make_chart_with_data:  dc_make_chart_with_data,

			dummy: {} // used to avoid syntax errors with trailing ','
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

//  console.log(dvdf);
