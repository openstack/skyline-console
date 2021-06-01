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
import { Progress, Tooltip, Row } from 'antd';
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
    infoColor: 'rgba(0, 104, 255, 0.65)',
    warnColor: 'rgba(254, 223, 64, 0.65)',
    dangerColor: 'rgba(235, 53, 77, 0.65)',
    label: '',
  };

  getColor = (value) => {
    const { wanValue, dangerValue, infoColor, warnColor, dangerColor } =
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
    const {
      name,
      resource: { used = 0, limit = 100 },
    } = this.props;
    let value = null;
    if (limit !== -1) {
      value = ((used / limit) * 100).toFixed(2);
    } else {
      value = 0;
    }
    const label = `${used} / ${limit !== -1 ? limit : t('Infinity')}`;
    const color = this.getColor(value);
    const options = {
      percent: value,
      strokeColor: color,
    };
    if (label) {
      options.showInfo = false;
    }
    const title = `${name} : ${label}`;
    return (
      <Tooltip title={`${value}%`} placement="top">
        <Row>{title}</Row>
        <Progress style={{ marginTop: 10, marginBottom: 10 }} {...options} />
      </Tooltip>
    );
  }
}
