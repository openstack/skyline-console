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
  isNil,
  isString,
  isUndefined,
  isNumber,
  isNaN,
  isArray,
  unescape,
} from 'lodash';
import { customAlphabet } from 'nanoid';

import { getLocalTimeStr, getKeepTime, getSinceTime } from './time';
import { SIZE_VALUE, MILLISECOND_IN_TIME_UNIT } from './constants';

/**
 * format size, output the value with unit
 * @param {Number} size - the number need to be format
 */
export const formatSize = (size, start = 0) => {
  const divisor = 1024;
  const units = [
    'B',
    'KiB',
    'MiB',
    'GiB',
    'TiB',
    'PiB',
    'EiB',
    'ZiB',
    'YiB',
    'BiB',
  ];
  let index = isNumber(start) ? start : 0;
  if (!isNumber(size) || isNaN(size)) {
    return size || '-';
  }
  while (size >= divisor && index < units.length - 1) {
    size = parseFloat(size / divisor).toFixed(2);
    index += 1;
  }
  if (index === 0) {
    size = parseInt(size, 10);
  }
  return `${size} ${units[index]}`;
};

/**
 * format used time(ms).
 * @param {Number} ms
 */
export const formatUsedTime = (ms) => {
  const { s, m, h, d, w } = MILLISECOND_IN_TIME_UNIT;
  if (ms < s) {
    return `${ms} ms`;
  }
  if (ms <= m) {
    return `${parseFloat(ms / s).toFixed(2)} s`;
  }
  if (ms <= h) {
    return `${parseFloat(ms / m).toFixed(2)} min`;
  }
  if (ms <= d) {
    return `${parseFloat(ms / h).toFixed(2)} h`;
  }
  if (ms <= w) {
    return `${parseFloat(ms / d).toFixed(2)} d`;
  }
  return `${parseFloat(ms / w).toFixed(2)} w`;
};

export const generateId = (length) =>
  customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', length || 6)();

export const getQueryString = (params) =>
  Object.keys(params)
    .filter((key) => params[key])
    .map((key) => `${key}=${params[key]}`)
    .join('&');

export const getYesNo = (input) => (input ? t('Yes') : t('No'));

export const getGiBValue = (input) => {
  const gb = 1024;
  if (isNaN(input) || isNil(input) || !input || !isNumber(input)) {
    return 0;
  }
  return parseFloat(Number(input / gb).toFixed(2));
};

export const getNoValue = (input, def) => {
  if (
    isNil(input) ||
    isUndefined(input) ||
    (isString(input) && input.trim() === '')
  ) {
    return def || '-';
  }
  return input;
};

export const firstUpperCase = (str) => {
  if (!isString(str) || str === '') {
    return str;
  }
  const [first, ...rest] = str;
  return first.toUpperCase() + rest.join('');
};

export const bytesFilter = (input) => {
  const { kb, mb, gb, tb } = SIZE_VALUE;
  if (isNaN(input) || isUndefined(input) || input === null || input < 0) {
    return '';
  }
  if (input >= tb) {
    const size = Number(input / tb).toFixed(2);
    return t('{ size } TiB', { size });
  }
  if (input >= gb) {
    const size = Number(input / gb).toFixed(2);
    return t('{ size } GiB', { size });
  }
  if (input >= mb) {
    const size = Number(input / mb).toFixed(2);
    return t('{ size } MiB', { size });
  }
  if (input >= kb) {
    const size = Number(input / kb).toFixed(2);
    return t('{ size } KiB', { size });
  }
  const size = Math.floor(input);
  return t('{ size } bytes', { size });
};

export const uppercaseFilter = (input) => {
  if (!input || !isString(input)) {
    return '-';
  }
  return input.toUpperCase();
};

export const toLocalTimeFilter = (input) => {
  if (!input) {
    return '-';
  }

  let dateTime;
  if (typeof input === 'number') {
    dateTime = new Date(input);
  } else {
    if (!/\+00:00$/.test(input)) {
      if (!/Z$/.test(input)) {
        input = input.concat('Z');
      }
    }

    dateTime = new Date(input);
  }

  let format = '%y-%m-%d %H:%M:%S';
  const f = {
    y: dateTime.getYear() + 1900,
    m: dateTime.getMonth() + 1,
    d: dateTime.getDate(),
    H: dateTime.getHours(),
    M: dateTime.getMinutes(),
    S: dateTime.getSeconds(),
  };
  Object.keys(f).forEach((timePart) => {
    format = format.replace(
      `%${timePart}`,
      f[timePart] < 10 ? `0${f[timePart]}` : f[timePart]
    );
  });
  return format;
};

export const renderFilterMap = {
  sinceTime: getSinceTime,
  keepTime: getKeepTime,
  yesNo: getYesNo,
  GiBValue: getGiBValue,
  noValue: getNoValue,
  bytes: bytesFilter,
  uppercase: uppercaseFilter,
  formatSize,
  toLocalTime: toLocalTimeFilter,
  toLocalTimeMoment: getLocalTimeStr,
};

export const getOptions = (obj) =>
  Object.keys(obj).map((key) => ({
    label: obj[key],
    value: key,
    key,
  }));

export const getYesNoList = () => [
  { value: true, label: t('Yes') },
  { value: false, label: t('No') },
];

/**
 * Create a contiguous array from start to end, closed on the left and open on the right
 * @param start
 * @param end
 */
export const generateArray = (start, end) => {
  const length = Math.abs(start - end);
  return Array.from(new Array(length).keys()).map((i) => i + start);
};

export const NoSetValue = 'noSelect';

export const getOptionsWithNoSet = (options) => {
  const newOptions = isArray(options) ? options : getOptions(options);
  const noSet = {
    value: NoSetValue,
    label: t('Not select'),
  };
  return [noSet, ...newOptions];
};

export const computePercentage = function (used, total, digits = 2) {
  if (used === 0) {
    return 0;
  }
  return parseFloat(
    ((parseFloat(used) / parseFloat(total)) * 100).toFixed(digits)
  );
};

export const groupArray = (arr, subGroupLength) => {
  let index = 0;
  const newArray = [];
  while (index < arr.length) {
    newArray.push(arr.slice(index, (index += subGroupLength)));
  }
  return newArray;
};

export const updateObjToAddSelectArray = (value = {}) => {
  const values = [];
  Object.keys(value).forEach((it, index) => {
    values.push({
      index,
      value: { key: it, value: value[it] },
    });
  });
  return values;
};

export const updateAddSelectValueToObj = (arr = []) => {
  const obj = {};
  arr.forEach((it) => {
    const { key, value } = it.value;
    if ((isString(value) && value) || !isString(value)) {
      obj[key] = value;
    }
  });
  return obj;
};

export const unescapeHtml = (message) => {
  if (isString(message)) {
    return unescape(message);
  }
  return message;
};

export const isAdminPage = (url) => url && url.indexOf('admin') >= 0;

export const isUserCenterPage = (url) =>
  url && (url === '/user' || url.startsWith('/user/'));

export const allSettled = (promises) => {
  if (!Promise.allSettled) {
    return Promise.all(
      promises.map((promise) =>
        promise
          .then((value) => ({ status: 'fulfilled', value }))
          .catch((reason) => ({ status: 'rejected', reason }))
      )
    );
  }
  return Promise.allSettled(promises);
};

/**
 * @param {T[]} items
 * @param {number} currentPage
 * @param {number} pageSize
 * @returns {T[]}
 */
export const paginate = (items, currentPage, pageSize) => {
  const skip = (currentPage - 1) * pageSize;
  return items.slice(skip, skip + pageSize);
};
