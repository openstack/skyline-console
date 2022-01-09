import { Select } from 'antd';
import React, { useContext } from 'react';
import BaseContentContext from './BaseContent';

const { Option } = Select;

const Intervals = (props) => {
  const { intervals, setInterval } = props;
  const { interval } = useContext(BaseContentContext);

  return (
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
      <Select value={interval} style={{ width: 120 }} onChange={setInterval}>
        {intervals.map((d) => (
          <Option key={d.value} value={d.value}>
            {d.text}
          </Option>
        ))}
      </Select>
    </>
  );
};

export default Intervals;
