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
import { DatePicker, Radio } from 'antd';
import { MILLISECOND_IN_TIME_UNIT } from 'utils/constants';
import { timeFormatStr } from 'utils/time';
import styles from './index.less';

const { RangePicker } = DatePicker;
const { h, d, w } = MILLISECOND_IN_TIME_UNIT;

export default class index extends Component {
  constructor(props) {
    super(props);
    const { defaultValue } = props;
    this.state = {
      defaultValue: defaultValue !== undefined ? defaultValue : h,
      value: null,
      start: null,
      end: null,
    };
  }

  componentDidMount() {
    const { defaultValue, value } = this.state;
    this.onChangeType(value || defaultValue);
  }

  get options() {
    return [
      { label: t('All'), value: 0 },
      { label: t('In the last hour'), value: h },
      { label: t('Recently a day'), value: d },
      { label: t('In the last 7 days'), value: w },
      { label: t('In the last 30 days'), value: 30 * d },
      { label: t('Custom'), value: 1 },
    ];
  }

  onChangeType = (value) => {
    const newValue = {
      value,
    };
    if (value !== 1) {
      newValue.start = undefined;
      newValue.end = undefined;
    }
    this.setState(
      {
        ...newValue,
      },
      () => {
        this.onChange(newValue);
      }
    );
  };

  onChange = (body) => {
    const { onChange } = this.props;
    onChange &&
      onChange({
        ...this.state,
        ...body,
      });
  };

  onDateChange = (date) => {
    const newValue = {
      start: date ? date[0] : null,
      end: date ? date[1] : null,
    };
    this.setState(
      {
        ...newValue,
      },
      () => {
        this.onChange(newValue);
      }
    );
  };

  render() {
    const { defaultValue, value } = this.state;
    return (
      <div className={styles.wrapper}>
        <Radio.Group
          defaultValue={defaultValue}
          value={value}
          options={this.options}
          buttonStyle="solid"
          optionType="button"
          onChange={(e) => this.onChangeType(e.target.value)}
        />
        {value === 1 && (
          <RangePicker
            onCalendarChange={this.onDateChange}
            format={timeFormatStr.YMDHm}
            showTime
          />
        )}
      </div>
    );
  }
}
