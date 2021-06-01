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
import PropTypes from 'prop-types';
import { Slider, InputNumber, Row, Col } from 'antd';

export default class index extends Component {
  static propTypes = {
    value: PropTypes.number,
    max: PropTypes.number,
    min: PropTypes.number,
    description: PropTypes.string,
  };

  static defaultProps = {
    max: 500,
    min: 0,
    value: 0,
  };

  constructor(props) {
    super(props);
    const { value, max, min, description } = props;
    const valueToInt = parseInt(value, 10);
    this.state = {
      inputValue: Number.isNaN(valueToInt) ? 1 : value,
      inputMax: max,
      inputMin: min,
      description,
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { min, max, description } = nextProps;

    if (
      min !== prevState.inputMin ||
      max !== prevState.inputMax ||
      description !== prevState.description
    ) {
      return {
        inputMin: min,
        inputMax: max,
        description,
      };
    }

    return null;
  }

  onChange = (value) => {
    this.setState({
      inputValue: value,
    });
    const { onChange } = this.props;
    onChange && onChange(value);
  };

  render() {
    const { inputValue, inputMax, inputMin, description } = this.state;
    return (
      <Row>
        <Col span={16}>
          <Slider
            min={inputMin}
            max={inputMax}
            onChange={this.onChange}
            value={inputValue}
          />
        </Col>
        <Col span={4}>
          <InputNumber
            min={inputMin}
            max={inputMax}
            style={{ marginLeft: 8 }}
            precision={0}
            formatter={(value) => `$ ${value}`.replace(/\D/g, '')}
            value={inputValue}
            onChange={this.onChange}
          />
        </Col>
        <Col span={24}>
          <span style={{ fontStyle: 'italic', color: '#7b8997' }}>
            {description}
          </span>
        </Col>
      </Row>
    );
  }
}
