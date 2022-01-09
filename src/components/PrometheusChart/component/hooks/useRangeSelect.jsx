import React, { useState } from 'react';
import { DatePicker, Radio } from 'antd';
import moment from 'moment';

import { getRange } from 'components/PrometheusChart/utils/utils';

const { RangePicker } = DatePicker;
function useRangeSelect(initialRange) {
  const [groupIndex, setGroupIndex] = useState(0);

  const [range, setRange] = useState(initialRange);

  const handleGroupChange = (e) => {
    const val = e.target.value;
    setGroupIndex(val);
    setRange(getRange(val));
  };

  const handleRangePickerChange = (dates) => {
    setGroupIndex(4);
    setRange(dates);
  };

  const Selector = () => (
    <Radio.Group
      value={groupIndex}
      onChange={handleGroupChange}
      style={{
        marginLeft: 20,
      }}
    >
      <Radio.Button value={0}>{t('Last Hour')}</Radio.Button>
      <Radio.Button value={1}>{t('Last Day')}</Radio.Button>
      <Radio.Button value={2}>{t('Last 7 Days')}</Radio.Button>
      <Radio.Button value={3}>{t('Last 2 Weeks')}</Radio.Button>
      <Radio.Button value={4} style={{ float: 'right', padding: 0 }}>
        <RangePicker
          showTime={{
            hideDisabledOptions: true,
            defaultValue: [
              moment('00:00:00', 'HH:mm:ss'),
              moment('00:00:00', 'HH:mm:ss'),
            ],
          }}
          disabledDate={disabledDate}
          disabledTime={disableTime}
          onChange={handleRangePickerChange}
          value={range}
          bordered={false}
          allowClear={false}
        />
      </Radio.Button>
    </Radio.Group>
  );

  return [range, Selector, groupIndex, setRange];
}

export default useRangeSelect;

function disableTime(pickRange) {
  const now = moment();
  if (now.isSame(pickRange, 'day')) {
    if (now.isSame(pickRange, 'hour')) {
      if (now.isSame(pickRange, 'minutes')) {
        return {
          disabledHours: () => filterRange(now.hour() + 1, 24),
          disabledMinutes: () => filterRange(now.minute() + 1, 60),
          disabledSeconds: () => filterRange(now.second() + 1, 60),
        };
      }
      return {
        disabledHours: () => filterRange(now.hour() + 1, 24),
        disabledMinutes: () => filterRange(now.minute() + 1, 60),
      };
    }
    return {
      disabledHours: () => filterRange(now.hour() + 1, 24),
    };
  }
}

function disabledDate(current) {
  // Can not select days after today
  return current > moment().endOf('day');
}

function filterRange(start, end) {
  const result = [];
  for (let i = start; i < end; i++) {
    result.push(i);
  }
  return result;
}
