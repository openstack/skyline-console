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

import React, { Component } from 'react';
import { Button, ConfigProvider, DatePicker, Radio, Select } from 'antd';
import { SyncOutlined } from '@ant-design/icons';
import moment from 'moment';
import { observer } from 'mobx-react';
import i18n from 'core/i18n';
import enUS from 'antd/es/locale/en_US';
import zhCN from 'antd/es/locale/zh_CN';
import { getRange } from 'components/PrometheusChart/utils/utils';
import styles from './index.less';

const { RangePicker } = DatePicker;
const { Option } = Select;

@observer
class TimeRangeSelect extends Component {
  constructor(props) {
    super(props);
    // const { store } = props;
    this.state = {
      filterValue: 0,
      datePickerRange: null,
    };
  }

  handleRefresh = () => {
    const { filterValue } = this.state;
    const { store, renderNodeSelect } = this.props;
    if (filterValue > -1) {
      const currentRange = getRange(filterValue);
      store.handleRangePickerChange(currentRange, true);
    } else {
      const { datePickerRange } = this.state;
      store.handleRangePickerChange(datePickerRange, true);
    }
    if (renderNodeSelect) {
      store.getNodes();
    }
  };

  handleFilterChange = (e) => {
    const { store } = this.props;
    const currentRange = getRange(e.target.value);
    this.setState({
      filterValue: e.target.value,
      datePickerRange: null,
    });
    store.handleRangePickerChange(currentRange);
  };

  handleRangePickerChange = (dates) => {
    const { store } = this.props;
    this.setState({
      datePickerRange: dates || [moment().subtract(1, 'hours'), moment()],
      filterValue: 4,
    });
    store.handleRangePickerChange(dates);
  };

  disableTime = (pickRange) => {
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
  };

  disabledDate(current) {
    // Can not select days after today
    return current > moment().endOf('day');
  }

  render() {
    const { store } = this.props;
    const { intervals, interval } = store;
    const { filterValue, datePickerRange } = this.state;
    const lang = i18n.getLocale();
    const localeProvider = lang === 'en' ? enUS : zhCN;

    return (
      <div style={this.props.style}>
        <Button
          type="default"
          icon={<SyncOutlined />}
          onClick={this.handleRefresh}
        />
        <Radio.Group
          value={filterValue}
          onChange={this.handleFilterChange}
          className={styles.range}
          style={{
            marginLeft: 20,
          }}
        >
          <Radio.Button value={0}>{t('Last Hour')}</Radio.Button>
          <Radio.Button value={1}>{t('Last Day')}</Radio.Button>
          <Radio.Button value={2}>{t('Last 7 Days')}</Radio.Button>
          <Radio.Button value={3}>{t('Last 2 Weeks')}</Radio.Button>
          <Radio.Button value={4} style={{ float: 'right', padding: 0 }}>
            <ConfigProvider locale={localeProvider}>
              <RangePicker
                showTime={{
                  hideDisabledOptions: true,
                  defaultValue: [
                    moment('00:00:00', 'HH:mm:ss'),
                    moment('00:00:00', 'HH:mm:ss'),
                  ],
                }}
                disabledDate={this.disabledDate}
                disabledTime={this.disableTime}
                onChange={this.handleRangePickerChange}
                value={datePickerRange}
                bordered={false}
                allowClear={false}
              />
            </ConfigProvider>
          </Radio.Button>
        </Radio.Group>
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
          onChange={store.handleIntervalChange}
        >
          {intervals.map((d) => (
            <Option key={d.value} value={d.value}>
              {d.text}
            </Option>
          ))}
        </Select>
      </div>
    );
  }
}

function filterRange(start, end) {
  const result = [];
  for (let i = start; i < end; i++) {
    result.push(i);
  }
  return result;
}

export default TimeRangeSelect;
