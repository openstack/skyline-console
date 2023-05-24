// Copyright 2021 99cloud
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import {
  isEmpty,
  isArray,
  isNaN,
  isUndefined,
  isNumber,
  isString,
  get,
  set,
  last,
  flatten,
  min,
  max,
} from 'lodash';
import { COLORS_MAP, MILLISECOND_IN_TIME_UNIT } from 'utils/constants';
import { getLocalTimeStr, getStrFromTimestamp } from 'utils/time';

const UnitTypes = {
  second: {
    conditions: [0.01, 0],
    units: ['s', 'ms'],
  },
  cpu: {
    conditions: [0.1, 0],
    units: ['core', 'm'],
  },
  memory: {
    conditions: [1024 ** 4, 1024 ** 3, 1024 ** 2, 1024, 0],
    units: ['TiB', 'GiB', 'MiB', 'KiB', 'Bytes'],
  },
  disk: {
    conditions: [1024 ** 4, 1024 ** 3, 1024 ** 2, 1024, 0],
    units: ['TiB', 'GiB', 'MiB', 'KiB', 'Bytes'],
  },
  throughput: {
    conditions: [1024 ** 4, 1024 ** 3, 1024 ** 2, 1024, 0],
    units: ['TiB/s', 'GiB/s', 'MiB/s', 'KiB/s', 'B/s'],
  },
  traffic: {
    conditions: [1024 ** 4, 1024 ** 3, 1024 ** 2, 1024, 0],
    units: ['TiB/s', 'GiB/s', 'MiB/s', 'KiB/s', 'B/s'],
  },
  bandwidth: {
    conditions: [1024 ** 2 / 8, 1024 / 8, 0],
    units: ['Mibps', 'Kibps', 'bps'],
  },
};

export const getSuitableUnit = (value, unitType) => {
  const config = UnitTypes[unitType];

  if (isEmpty(config)) return '';

  // value can be an array or a single value
  const values = isArray(value) ? value : [[0, Number(value)]];
  let result = last(config.units);
  config.conditions.some((condition, index) => {
    const triggered = values.some(
      (_value) =>
        ((isArray(_value) ? get(_value, '[1]') : Number(_value)) || 0) >=
        condition
    );

    if (triggered) {
      result = config.units[index];
    }
    return triggered;
  });
  return result;
};

export const getSuitableValue = (
  value,
  unitType = 'default',
  defaultValue = 0
) => {
  if ((!isNumber(value) && !isString(value)) || isNaN(Number(value))) {
    return defaultValue;
  }
  const unit = getSuitableUnit(value, unitType);
  const unitText = unit || '';
  const count = getValueByUnit(value, unit || unitType);
  return `${count}${unitText}`;
};

export const getValueByUnit = (num, unit) => {
  let value = parseFloat(num);

  switch (unit) {
    default:
      break;
    case '':
    case 'default':
      return value;
    case 'iops':
      return Math.round(value);
    case '%':
      value *= 100;
      break;
    case 'm':
      value *= 1000;
      if (value < 1) return 0;
      break;
    case 'KiB':
    case 'KiB/s':
      value /= 1024;
      break;
    case 'MiB':
    case 'MiB/s':
      value /= 1024 ** 2;
      break;
    case 'GiB':
    case 'GiB/s':
      value /= 1024 ** 3;
      break;
    case 'TiB':
    case 'TiB/s':
      value /= 1024 ** 4;
      break;
    case 'Bytes':
    case 'B':
    case 'B/s':
      break;
    case 'KB':
    case 'KB/s':
      value /= 1000;
      break;
    case 'MB':
    case 'MB/s':
      value /= 1000 ** 2;
      break;
    case 'GB':
    case 'GB/s':
      value /= 1000 ** 3;
      break;
    case 'TB':
    case 'TB/s':
      value /= 1000 ** 4;
      break;
    case 'bps':
      value *= 8;
      break;
    case 'Kbps':
      value = (value * 8) / 1024;
      break;
    case 'Mbps':
      value = (value * 8) / 1024 / 1024;
      break;
    case 'ms':
      value *= 1000;
      break;
  }

  return Number(value) === 0 ? 0 : Number(value.toFixed(2));
};

export const getFormatTime = (ms) =>
  getStrFromTimestamp(ms).replace(/:00$/g, '');

export const getChartData = ({
  type,
  unit,
  xKey = 'time',
  legend = [],
  valuesData = [],
  xFormatter,
}) => {
  /*
    build a value map => { 1566289260: {...} }
    e.g. { 1566289260: { 'utilisation': 30.2 } }
  */
  const valueMap = {};
  valuesData.forEach((values, index) => {
    values.forEach((item) => {
      const time = parseInt(get(item, [0], 0), 10);
      const value = get(item, [1]);
      const key = get(legend, [index]);

      if (time && !valueMap[time]) {
        valueMap[time] = legend.reduce((obj, xAxisKey) => {
          if (!obj[xAxisKey]) obj[xAxisKey] = null;
          return obj;
        }, {});
      }

      if (key && valueMap[time]) {
        valueMap[time][key] =
          value === '-1'
            ? null
            : getValueByUnit(value, isUndefined(unit) ? type : unit);
      }
    });
  });

  const formatter = (key) => (xKey === 'time' ? getFormatTime(key) : key);

  // generate the chart data
  const chartData = Object.entries(valueMap).map(([key, value]) => ({
    [xKey]: (xFormatter || formatter)(key),
    ...value,
  }));

  return chartData;
};

export const getAreaChartOps = ({
  type,
  title,
  unitType,
  xKey = 'time',
  legend = [],
  data = [],
  xFormatter,
  ...rest
}) => {
  const seriesData = isArray(data) ? data : [];
  const valuesData = seriesData.map((result) => get(result, 'values') || []);
  const unit = unitType
    ? getSuitableUnit(flatten(valuesData), unitType)
    : rest.unit;

  const chartData = getChartData({
    type,
    unit,
    xKey,
    legend,
    valuesData,
    xFormatter,
  });

  const xAxisTickFormatter =
    xKey === 'time' ? getXAxisTickFormatter(chartData) : (value) => value;

  return {
    ...rest,
    title,
    unit,
    xAxisTickFormatter,
    data: chartData,
  };
};

export const getXAxisTickFormatter = (chartValues = []) => {
  const timeList = chartValues.map(({ time }) => +new Date(time));
  const minTime = min(timeList);
  const maxTime = max(timeList);

  if (maxTime - minTime > 8640000) {
    return (time) => getLocalTimeStr(time, t('Do HH:mm'));
  }

  return (time) => getLocalTimeStr(time, 'HH:mm:ss');
};

export const getLastMonitoringData = (data) => {
  const result = {};

  Object.entries(data).forEach(([key, value]) => {
    const values = get(value, 'data.result[0].values', []) || [];
    const _value = isEmpty(values)
      ? get(value, 'data.result[0].value', []) || []
      : last(values);
    set(result, `[${key}].value`, _value);
  });

  return result;
};

export const getTimesData = (data) => {
  const result = [];

  data.forEach((record) => {
    const values = get(record, 'values') || [];

    values.forEach((value) => {
      const time = get(value, '[0]', 0);
      if (!result.includes(time)) {
        result.push(time);
      }
    });
  });
  return result.sort();
};

export const getZeroValues = () => {
  const values = [];
  let time = parseInt(Date.now() / 1000, 10) - 6000;
  for (let i = 0; i < 10; i++) {
    values[i] = [time, 0];
    time += 600;
  }
  return values;
};

export const getColorByName = (colorName = '#fff') =>
  COLORS_MAP[colorName] || colorName;

export const startAutoRefresh = (context, options = {}) => {
  const params = {
    method: 'fetchData',
    interval: 5000, // milliseconds
    leading: true,
    ...options,
  };

  if (context && context[params.method]) {
    const fetch = context[params.method];

    if (params.leading) {
      fetch({ autoRefresh: true });
    }

    context.timer = setInterval(() => {
      fetch({ autoRefresh: true });
    }, params.interval);
  }
};

export const stopAutoRefresh = (context) => {
  if (context && context.timer) {
    clearInterval(context.timer);
    context.timer = null;
  }
};

export const isSameDay = (preTime, nextTime) =>
  Math.floor(preTime / 86400000) === Math.floor(nextTime / 86400000);

export const timeAliasReg = /(\d+)(\w+)/;

export const timestampify = (timeAlias) => {
  const [, count = 0, unit] = timeAlias.match(timeAliasReg) || [];
  return Number(count) * (MILLISECOND_IN_TIME_UNIT[unit] || 0);
};

export const fillEmptyMetrics = (params, result) => {
  if (!params.times || !params.start || !params.end) {
    return result;
  }

  const format = (num) => String(num).replace(/\..*$/, '');
  const step = Math.floor((params.end - params.start) / params.times);
  const correctCount = params.times + 1;

  Object.values(result).forEach((item) => {
    const _result = get(item, 'data.result');
    if (!isEmpty(_result)) {
      _result.forEach((resultItem) => {
        const curValues = resultItem.values || [];
        const curValuesMap = curValues.reduce(
          (prev, cur) => ({
            ...prev,
            [format(cur[0])]: cur[1],
          }),
          {}
        );

        if (curValues.length < correctCount) {
          const newValues = [];
          for (let index = 0; index < correctCount; index++) {
            const time = format(params.start + index * step);
            newValues.push([time, curValuesMap[time] || '0']);
          }
          resultItem.values = newValues;
        }
      });
    }
  });

  return result;
};

export const cephStatusMap = {
  0: t('Healthy'),
  1: t('Warning'),
  2: t('Error'),
};

export const cephStatusColorMap = {
  0: globalCSS.successColor,
  1: globalCSS.warnDarkColor,
  2: globalCSS.errorColor,
};
