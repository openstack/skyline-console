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

import { getStrFromTimestamp, getTimestamp } from 'utils/time';
import moment from 'moment';
import client from 'src/client';
import { get, isArray } from 'lodash';

export const ChartType = {
  ONELINE: 'oneline',
  MULTILINE: 'multiline',
  ONELINEDEVICES: 'oneline_devices',
  MULTILINEDEVICES: 'multiline_devices',
};

export const getXScale = (timeRange) => {
  const rangeMinutes = moment(timeRange[1]).diff(
    moment(timeRange[0]),
    'minutes',
    true
  );
  const index =
    (rangeMinutes > 20160 && 4) ||
    (rangeMinutes > 10080 && rangeMinutes <= 20160 && 3) ||
    (rangeMinutes > 1440 && rangeMinutes <= 10080 && 2) ||
    (rangeMinutes > 60 && rangeMinutes <= 1440 && 1) ||
    (rangeMinutes > 0 && rangeMinutes <= 60 && 0) ||
    0;
  return {
    type: 'time',
    ...maskAndTicketCountDict[index],
  };
};

export const baseReturnFunc = (d) => d;

export function fetchPrometheus(
  query,
  getRangeType = 'range',
  currentRange = [],
  interval = 10
) {
  if (getRangeType === 'current') {
    return client.skyline.query.list({
      query,
    });
  }
  if (getRangeType === 'range') {
    return client.skyline.queryRange.list({
      query,
      start: getTimestamp(currentRange[0]),
      end: getTimestamp(currentRange[1]),
      step: interval,
    });
  }
  return Promise.resolve();
}

// Add params to the query string, such as hostname, etc
export function getRequestUrl(url, params, finalFormatFunc, baseParams) {
  const totalParams = { ...params, ...baseParams };
  return finalFormatFunc(
    Object.keys(totalParams).length === 0 ? url : addParams(url, totalParams)
  );
}

export function addParams(query, params) {
  let addStr = '';
  Object.keys(params).forEach((key) => {
    if (isArray(params[key])) {
      addStr += `${key}=~"${params[key].join('|')}",`;
    } else {
      addStr += `${key}="${params[key]}",`;
    }
  });
  return `${query}{${addStr.substring(0, addStr.length - 1)}}`;
}

// 1 hour ago - now
export const defaultOneHourAgo = () => [
  moment().subtract(1, 'hours'),
  moment(),
];

export const getRange = (type) =>
  ({
    // last 2 weeks
    3: [moment().subtract(2, 'weeks'), moment()],
    // last 7 days
    2: [moment().subtract(1, 'weeks'), moment()],
    // last day
    1: [moment().subtract(1, 'days'), moment()],
    // last hour
    0: [moment().subtract(1, 'hours'), moment()],
  }[type] || [moment().subtract(1, 'hours'), moment()]);

export function getInterval(currentRange) {
  const start = (currentRange || getRange(0))[0];
  const end = (currentRange || getRange(0))[1];
  const rangeMinutes = end.diff(start, 'minutes');
  const index =
    (rangeMinutes > 44640 && 3) ||
    (rangeMinutes > 1440 && rangeMinutes <= 44640 && 2) ||
    (rangeMinutes > 60 && rangeMinutes <= 1440 && 1) ||
    (rangeMinutes > 0 && rangeMinutes <= 60 && 0) ||
    0;
  return range2IntervalsDict[index];
}

const maskAndTicketCountDict = [
  {
    // Format used within an hour
    // mask: 'HH:mm:ss',
    formatter: (d) => getStrFromTimestamp(d, 'HH:mm:ss'),
    ticketCount: 6,
  },
  {
    // Format used within an day
    // mask: 'HH:mm:ss',
    formatter: (d) => getStrFromTimestamp(d, 'HH:mm:ss'),
    ticketCount: 6,
  },
  {
    // Format used within 7 days
    // mask: 'MM-DD HH:mm',
    formatter: (d) => getStrFromTimestamp(d, 'MM-DD HH:mm'),
    ticketCount: 3,
  },
  {
    // Format used within 14 days
    // mask: 'MM-DD HH:mm',
    formatter: (d) => getStrFromTimestamp(d, 'MM-DD HH:mm'),
    ticketCount: 6,
  },
  {
    // Other
    // mask: 'MM-DD HH:mm',
    formatter: (d) => getStrFromTimestamp(d, 'MM-DD HH:mm'),
    ticketCount: 6,
  },
];

export const range2IntervalsDict = [
  [
    {
      text: t('10s'),
      value: 10,
    },
    {
      text: t('1min'),
      value: 60,
    },
    {
      text: t('5min'),
      value: 300,
    },
  ],
  [
    {
      text: t('1min'),
      value: 60,
    },
    {
      text: t('5min'),
      value: 300,
    },
    {
      text: t('1H'),
      value: 3600,
    },
  ],
  [
    {
      text: t('1H'),
      value: 3600,
    },
    {
      text: t('1D'),
      value: 86400,
    },
  ],
  [
    {
      text: t('1D'),
      value: 86400,
    },
  ],
];

export const getPromises = (metricKey) => {
  const queries = get(METRICDICT, metricKey);
  return queries.url.map((u, idx) => {
    // get aggregate data in order
    const finalFormatFunc =
      (queries.finalFormatFunc || [])[idx] || baseReturnFunc;
    // get base params in order
    const baseParams = (queries.baseParams || [])[idx] || {};
    const finalUrl = getRequestUrl(u, {}, finalFormatFunc, baseParams);
    return fetchPrometheus(finalUrl, 'current');
  });
};
