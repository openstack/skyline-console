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

export const MAX_REPORT_DAYS = 366;

// Use calendar dates in UTC, matching the summary store's daily boundaries.
export const reportDate = (value) => moment.utc(value.format('YYYY-MM-DD'));

export const getReportRange = (
  period,
  amount = 1,
  previous = false,
  now = moment()
) => {
  const today = reportDate(now);
  const unit = period === 'week' ? 'isoWeek' : period;
  const end = previous
    ? today.clone().startOf(unit).subtract(1, 'day')
    : today.clone();
  const start = previous
    ? end
        .clone()
        .subtract(amount - 1, period)
        .startOf(unit)
    : today.clone().startOf(unit);
  return [start, end];
};

export const shiftReportRange = (
  range,
  period,
  amount,
  direction,
  now = moment()
) => {
  const unit = period === 'week' ? 'isoWeek' : period;
  const start = reportDate(range[0])
    .add(direction * amount, period)
    .startOf(unit);
  const end = start.clone().add(amount, period).subtract(1, 'day');
  const today = reportDate(now);
  if (start.isAfter(today, 'day')) {
    return null;
  }
  return [start, moment.min(end, today)];
};

export const isValidReportRange = (range, now = moment()) => {
  if (
    !range ||
    range.length !== 2 ||
    !range.every((date) => date && date.isValid())
  ) {
    return false;
  }
  const [start, end] = range.map(reportDate);
  const days = end.diff(start, 'days') + 1;
  return days > 0 && days <= MAX_REPORT_DAYS && !end.isAfter(reportDate(now));
};
