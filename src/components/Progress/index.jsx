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
import { Progress, Tooltip } from 'antd';
import PropTypes from 'prop-types';

export default class index extends Component {
  static propTypes = {
    wanValue: PropTypes.number,
    dangerValue: PropTypes.number,
    infoColor: PropTypes.string,
    warnColor: PropTypes.string,
    dangerColor: PropTypes.string,
    value: PropTypes.number,
    label: PropTypes.string,
  };

  static defaultProps = {
    wanValue: 70,
    dangerValue: 90,
    infoColor: globalCSS.primaryColor,
    warnColor: globalCSS.warnDarkColor,
    dangerColor: globalCSS.dangerColor,
    label: '',
  };

  getColor = () => {
    const { value, wanValue, dangerValue, infoColor, warnColor, dangerColor } =
      this.props;
    if (value < wanValue) {
      return infoColor;
    }
    if (value < dangerValue) {
      return warnColor;
    }
    return dangerColor;
  };

  render() {
    const { value, label } = this.props;
    const color = this.getColor();
    const options = {
      percent: value,
      size: 'small',
      strokeColor: color,
    };
    if (label) {
      options.showInfo = false;
    }
    const tip = [undefined, null, ''].includes(value) ? '-' : `${value}%`;
    return (
      <Tooltip title={tip} placement="top">
        <Progress {...options} />
        {label}
      </Tooltip>
    );
  }
}
