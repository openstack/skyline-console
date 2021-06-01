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

import moment from 'moment';
import { SECOND_IN_TIME_UNIT } from 'utils/constants';
import {
  checkTimeIn,
  getKeepTime,
  getLocalTime,
  getLocalTimeStr,
  getSinceTime,
  getStrFromTimestamp,
  getTimestamp,
  timeFormatStr,
} from './time';

describe('test time', () => {
  const now = moment();

  it('getLocalTime', () => {
    expect(getLocalTime(now).format()).toEqual(now.utc().local().format());
  });

  it('getLocalTimeStr', () => {
    expect(getLocalTimeStr(now)).toBe(now.format(timeFormatStr.YMDHms));
  });

  it('getTimestamp', () => {
    expect(getTimestamp(now)).toBe(now.unix());
  });

  it('getStrFromTimestamp', () => {
    expect(getStrFromTimestamp(now.unix())).toBe(
      now.format(timeFormatStr.YMDHms)
    );
  });

  it('checkTimeIn', () => {
    const start = now.clone().subtract(1, 'd');
    const end = now.clone().add(1, 'd');
    expect(checkTimeIn(now, start, end)).toBe(true);
    expect(checkTimeIn(start, now, end)).toBe(false);
    expect(checkTimeIn(start, end, now)).toBe(false);
  });

  it('getSinceTime', () => {
    expect(getSinceTime(now.clone().subtract(1, 'd'))).toBe(
      now.clone().subtract(1, 'd').from()
    );
  });

  it('getKeepTime', () => {
    expect(getKeepTime(SECOND_IN_TIME_UNIT.s)).toBe(t('to delete'));
    expect(getKeepTime(SECOND_IN_TIME_UNIT.m)).toBe(
      t('{interval, plural, =1 {one minute} other {# minutes} } later delete', {
        interval: 1,
      })
    );
    expect(getKeepTime(SECOND_IN_TIME_UNIT.month)).toBe(
      t('{interval, plural, =1 {one week} other {# weeks} } later delete', {
        interval: 4,
      })
    );
    expect(getKeepTime(-1)).toBe(t('Permanent'));
  });
});
