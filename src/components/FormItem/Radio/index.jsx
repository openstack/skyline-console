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
import { Radio } from 'antd';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import styles from './index.less';

export default class index extends Component {
  static propTypes = {
    options: PropTypes.array,
    onChange: PropTypes.func,
    optionType: PropTypes.string,
    buttonStyle: PropTypes.string,
    onlyRadio: PropTypes.bool,
    isWrappedValue: PropTypes.bool,
  };

  static defaultProps = {
    options: [],
    optionType: 'button',
    buttonStyle: 'solid',
    onlyRadio: false,
    isWrappedValue: false,
  };

  onChange = (e) => {
    const { value } = e.target;
    const { options, onChange, isWrappedValue } = this.props;
    if (!isWrappedValue) {
      onChange && onChange(value);
    } else {
      const option = options.find((it) => it.value === value);
      onChange && onChange(option);
    }
  };

  getValue = (isWrappedValue, value) => {
    if (value === undefined) return value;
    return isWrappedValue ? value.value : value;
  };

  render() {
    const {
      options,
      optionType,
      buttonStyle,
      onlyRadio,
      className,
      value,
      isWrappedValue,
      ...rest
    } = this.props;
    const items = options.map((it) =>
      optionType === 'default' ? (
        <Radio value={it.value} key={it.value} disabled={it.disabled}>
          {it.label}
        </Radio>
      ) : (
        <Radio.Button value={it.value} key={it.value} disabled={it.disabled}>
          {it.label}
        </Radio.Button>
      )
    );
    return (
      <Radio.Group
        optionType={optionType}
        buttonStyle={buttonStyle}
        {...rest}
        className={classnames(className, onlyRadio ? styles['only-radio'] : '')}
        onChange={this.onChange}
        value={this.getValue(isWrappedValue, value)}
      >
        {items}
      </Radio.Group>
    );
  }
}
