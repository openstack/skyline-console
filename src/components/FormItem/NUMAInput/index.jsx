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
import { InputNumber } from 'antd';
import PropTypes from 'prop-types';
import styles from './index.less';

export default class index extends Component {
  static propTypes = {
    onChange: PropTypes.func,
    // eslint-disable-next-line react/no-unused-prop-types
    value: PropTypes.object,
  };

  static defaultProps = {
    onChange: null,
    value: {
      cpu: 1,
      ram: 1024,
    },
  };

  constructor(props) {
    super(props);
    this.state = {
      cpu: 1,
      ram: 512,
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { cpu, ram } = nextProps.value || {};
    if (cpu !== prevState.cpu || ram !== prevState.ram) {
      return {
        cpu,
        ram,
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

  onCpuChange = (value) => {
    this.onChange({
      ...this.state,
      cpu: value,
    });
  };

  onRamChange = (value) => {
    this.onChange({
      ...this.state,
      ram: value,
    });
  };

  render() {
    const { cpu, ram } = this.state;
    const config = {
      min: 1,
      precision: 0,
      style: {
        width: 120,
      },
      formatter: (value) => `$ ${value}`.replace(/\D/g, ''),
    };
    return (
      <>
        <span className={styles.cpu}>{t('CPU(Core)')}</span>
        <InputNumber value={cpu} onChange={this.onCpuChange} {...config} />
        <span className={styles.ram}>{t('RAM (MiB)')}</span>
        <InputNumber value={ram} onChange={this.onRamChange} {...config} />
      </>
    );
  }
}
