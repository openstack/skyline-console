import { Select } from 'antd';
import React, { useEffect, useState } from 'react';
import { getInterval } from '../../utils/utils';

const { Option } = Select;

const useIntervals = (range) => {
  let intervals = getInterval(range);

  const [interval, setInterval] = useState(intervals[0].value);

  const handleIntervalChange = (e) => {
    setInterval(e);
  };

  useEffect(() => {
    intervals = getInterval(range);
    handleIntervalChange(intervals[0].value);
  }, [range]);

  const Intervals = () => (
    <>
      <span
        style={{
          marginLeft: 20,
          fontSize: 14,
          fontWeight: 400,
          color: 'rgba(0,0,0,.85)',
        }}
      >
        {t('Time Interval: ')}
      </span>
      <Select
        value={interval}
        style={{ width: 120 }}
        onChange={handleIntervalChange}
      >
        {intervals.map((d) => (
          <Option key={d.value} value={d.value}>
            {d.text}
          </Option>
        ))}
      </Select>
    </>
  );

  return [interval, Intervals];
};

export default useIntervals;
