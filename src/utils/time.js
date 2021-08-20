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

import { isString } from 'lodash';
import moment from 'moment';
import { SECOND_IN_TIME_UNIT } from 'utils/constants';

export const timeFormatStr = {
  YMDTHms: 'YYYY-MM-DDTHH:mm:ss',
  YMDHms: 'YYYY-MM-DD HH:mm:ss',
  YMDHm: 'YYYY-MM-DD HH:mm',
  YMD: 'YYYY-MM-DD',
  MDHm: 'MM-DD HH:mm',
};

export const getLocalTime = (time) => moment.utc(time).local();

export const getLocalTimeStr = (time, formatter = timeFormatStr.YMDHms) => {
  const realFormatter = isString(formatter) ? formatter : timeFormatStr.YMDHms;
  return getLocalTime(time).format(realFormatter);
};

export const getTimestamp = (time) => getLocalTime(time).unix();

export const getStrFromTimestamp = (stamp, formatter = timeFormatStr.YMDHms) =>
  moment.unix(Number(stamp)).format(formatter);

export const checkTimeIn = (inputTime, start, end) => {
  if (!inputTime) {
    return false;
  }
  const inputT = getLocalTime(inputTime);
  const startT = getLocalTime(start);
  const endT = getLocalTime(end);
  // console.log(inputT, startT, endT);
  if (!start) {
    return inputT <= endT;
  }
  if (!end) {
    return inputT >= startT;
  }
  return inputT.isAfter(startT) && inputT.isBefore(endT);
};

export const getSinceTime = (input) => {
  if (!input) {
    return '-';
  }
  return getLocalTime(input).fromNow();
};

export const getKeepTime = (input) => {
  const { m, h, d, w } = SECOND_IN_TIME_UNIT;
  if (!input) {
    return '-';
  }
  if (input < 0) {
    return t('Permanent');
  }
  if (input < m) {
    return t('to delete');
  }
  let interval = 0;
  if (input < h) {
    interval = parseInt(input / m, 10);
    return t(
      '{interval, plural, =1 {one minute} other {# minutes} } later delete',
      { interval }
    );
  }
  if (input < d) {
    interval = parseInt(input / h, 10);
    return t(
      '{interval, plural, =1 {one hour} other {# hours} } later delete',
      { interval }
    );
  }
  if (input < w) {
    interval = parseInt(input / d, 10);
    return t('{interval, plural, =1 {one day} other {# days} } later delete', {
      interval,
    });
  }
  interval = parseInt(input / w, 10);
  return t('{interval, plural, =1 {one week} other {# weeks} } later delete', {
    interval,
  });
};
