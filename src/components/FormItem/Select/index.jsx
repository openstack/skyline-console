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
import { Select, Row, Col, Checkbox } from 'antd';
import { isUndefined, isNull } from 'lodash';
import styles from './index.less';

export default class index extends Component {
  constructor(props) {
    super(props);
    const { checkOptions } = props;
    if (checkOptions) {
      this.state = {
        selectAll: false,
      };
    }
  }

  onChange = (value, option) => {
    const { onChange, isWrappedValue } = this.props;
    onChange && onChange(isWrappedValue ? option : value);
  };

  getValue = () => {
    const { value, isWrappedValue } = this.props;
    if (value === undefined) return value;
    return isWrappedValue ? value.value : value;
  };

  onCheckChange = () => {
    const { selectAll } = this.state;
    const { options, checkOptions } = this.props;
    this.setState(
      {
        selectAll: 1 - selectAll,
      },
      this.onChange(
        selectAll === 1
          ? checkOptions[checkOptions.length - 1].value
          : options[options.length - 1].value
      )
    );
  };

  render() {
    const {
      value,
      placeholder = t('Please select'),
      isWrappedValue,
      checkOptions,
      checkBoxInfo,
      allowClear = true,
      showSearch = true,
      ...rest
    } = this.props;
    if (isUndefined(value) || isNull(value)) {
      return (
        <Select
          {...rest}
          allowClear={allowClear}
          showSearch={showSearch}
          placeholder={placeholder}
          onChange={this.onChange}
        />
      );
    }
    if (checkOptions) {
      const { options } = this.props;
      const { selectAll } = this.state;
      const box = (
        <Checkbox onChange={this.onCheckChange} checked={selectAll}>
          {checkBoxInfo || t('Show all Data')}
        </Checkbox>
      );
      return (
        <Row gutter={24}>
          <Col span={12}>
            <Select
              {...rest}
              allowClear={allowClear}
              showSearch={showSearch}
              placeholder={placeholder}
              onChange={this.onChange}
              value={this.getValue()}
              options={selectAll === 1 ? checkOptions : options}
            />
          </Col>
          <Col span={12} className={styles.checkbox}>
            {box}
          </Col>
        </Row>
      );
    }
    return (
      <Select
        {...rest}
        allowClear={allowClear}
        showSearch={showSearch}
        placeholder={placeholder}
        onChange={this.onChange}
        value={this.getValue()}
      />
    );
  }
}
