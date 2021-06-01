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
import { Button } from 'antd';
import { CaretUpOutlined, CaretDownOutlined } from '@ant-design/icons';
import styles from './index.less';

export default class index extends Component {
  constructor(props) {
    super(props);
    const { value } = props;
    this.state = {
      moreValue: value,
    };
  }

  onChangeValue = () => {
    const { moreValue } = this.state;
    this.setState(
      {
        moreValue: !moreValue,
      },
      () => {
        const { onChange } = this.props;
        if (onChange) {
          onChange(this.state.moreValue);
        }
      }
    );
  };

  render() {
    const { moreValue } = this.state;

    if (moreValue) {
      return (
        <Button type="link" className={styles.btn} onClick={this.onChangeValue}>
          {t('Hide Advanced Options')} <CaretUpOutlined />
        </Button>
      );
    }
    return (
      <Button type="link" className={styles.btn} onClick={this.onChangeValue}>
        {t('Expand Advanced Options')}
        <CaretDownOutlined />
      </Button>
    );
  }
}
