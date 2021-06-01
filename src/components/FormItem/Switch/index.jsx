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
import { Switch } from 'antd';
import PropTypes from 'prop-types';

export default class index extends Component {
  static propTypes = {
    value: PropTypes.bool,
    className: PropTypes.string,
    checkedText: PropTypes.string,
    uncheckedText: PropTypes.string,
    disabled: PropTypes.bool,
    onChange: PropTypes.func,
  };

  static defaultProps = {
    value: false,
    checkedText: t('On'),
    uncheckedText: t('Off'),
    disabled: false,
  };

  onChange = (checked) => {
    const { onChange } = this.props;
    onChange && onChange(checked);
  };

  render() {
    const { value, className, checkedText, uncheckedText, disabled } =
      this.props;
    const conf = {
      checked: value,
      className,
      checkedChildren: checkedText,
      unCheckedChildren: uncheckedText,
      disabled,
      onChange: this.onChange,
    };
    return <Switch {...conf} />;
  }
}
