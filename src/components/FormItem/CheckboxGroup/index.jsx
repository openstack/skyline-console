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
import { Checkbox, Row, Col } from 'antd';
import PropTypes from 'prop-types';

export default class index extends Component {
  static propTypes = {
    value: PropTypes.object,
    className: PropTypes.string,
    options: PropTypes.array,
    onChange: PropTypes.func,
    span: PropTypes.number,
  };

  static defaultProps = {
    value: {},
    options: [],
    span: 8,
  };

  onChange = (checkedValues) => {
    const { onChange, options } = this.props;
    const value = {};
    checkedValues.forEach((it) => {
      value[it] = true;
    });
    options.forEach((option) => {
      const { value: key } = option;
      value[key] = checkedValues.indexOf(key) >= 0;
    });
    onChange && onChange(value);
  };

  getValues = () => {
    const { value, options } = this.props;
    const values = [];
    options.forEach((it) => {
      const key = it.value;
      if (value[key]) {
        values.push(key);
      }
    });
    return values;
  };

  render() {
    const { className, options, span } = this.props;
    const values = this.getValues();
    const conf = {
      className,
      onChange: this.onChange,
    };
    return (
      <Checkbox.Group {...conf} value={values} style={{ width: '100%' }}>
        <Row>
          {options.map((opt) => (
            <Col span={span} key={opt.value}>
              <Checkbox value={opt.value} disabled={!!opt.disabled}>
                {opt.label}
              </Checkbox>
            </Col>
          ))}
        </Row>
      </Checkbox.Group>
    );
  }
}
