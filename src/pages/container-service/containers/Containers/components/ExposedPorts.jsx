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

import React from 'react';
import { Select, Row, Col, Form } from 'antd';
import PropTypes from 'prop-types';
import InputInt from 'components/FormItem/InputInt';
import styles from './index.less';

export default class ExposedPorts extends React.Component {
  static propTypes = {
    onChange: PropTypes.func,
    value: PropTypes.any,
  };

  constructor(props) {
    super(props);
    this.state = {
      port: '',
      protocol: '',
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { port, protocol } = nextProps.value || {};
    if (port !== prevState.port || protocol !== prevState.protocol) {
      return {
        port,
        protocol,
      };
    }
    return null;
  }

  onChange = (value) => {
    const { onChange } = this.props;
    if (onChange) {
      onChange(value);
    }
  };

  onPortChange = (value) => {
    this.onChange({
      ...this.state,
      port: value,
    });
  };

  onProtocolChange = (value) => {
    this.onChange({
      ...this.state,
      protocol: value,
    });
  };

  render() {
    const { port, protocol } = this.state;
    const inputPort = (
      <InputInt value={port} min={1} onChange={this.onPortChange} />
    );
    const selectProtocol = (
      <Select
        value={protocol}
        options={this.props.optionsProtocol}
        onChange={this.onProtocolChange}
        className={styles.select}
        required
      />
    );

    return (
      <Form.Item className={styles['select-input']}>
        <Row gutter={8}>
          <Col span={6}>
            <span className={styles.label}>{t('Port')}</span>
            {inputPort}
          </Col>
          <Col span={8}>
            <span className={styles.label}>{t('Protocol')}</span>
            {selectProtocol}
          </Col>
        </Row>
      </Form.Item>
    );
  }
}
