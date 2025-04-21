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
import { Badge } from 'antd';
import { isBoolean, isString } from 'lodash';

const successKeys = [
  'enabled',
  'running',
  'up',
  'active',
  'available',
  'in-use',
  'success',
  'new',
  'finish',
  'received',
  'resolved',
  'power on',
  'complete',
  'online',
  'ready',
  'pass',
];

const successKeysContain = ['complete'];

const processingKeys = [
  'wait_feedback',
  'build',
  'queued',
  'stopped',
  'rescued',
  'resized',
  'reboot',
  'soft-reboot',
];

const processingKeysContain = ['progress', 'ing'];

const errorKeys = [
  'error_deleting',
  'failed',
  'failure',
  'firing',
  'power off',
  'error',
  'offline',
  'refuse',
];

const errorKeysContain = ['fail'];

const warningKeys = [];

const getStatus = (key) => {
  if (
    successKeys.indexOf(key) >= 0 ||
    successKeysContain.find((it) => key.indexOf(it) >= 0)
  ) {
    return 'success';
  }
  if (
    processingKeys.indexOf(key) >= 0 ||
    processingKeysContain.find((it) => key.indexOf(it) >= 0)
  ) {
    return 'processing';
  }
  if (
    errorKeys.indexOf(key) >= 0 ||
    errorKeysContain.find((it) => key.indexOf(it) >= 0)
  ) {
    return 'error';
  }
  if (warningKeys.indexOf(key) >= 0) {
    return 'warning';
  }
  return 'default';
};

export default class index extends Component {
  static propTypes = {
    status: PropTypes.any,
    text: PropTypes.string,
    style: PropTypes.object,
  };

  static defaultProps = {
    status: 'enabled',
    text: 'Enabled',
    style: {},
  };

  getStyle() {
    const { style } = this.props;
    return {
      ...style,
      whiteSpace: 'nowrap',
    };
  }

  render() {
    const { status, text } = this.props;
    let realStatus = 'default';
    if (isBoolean(status)) {
      realStatus = status ? 'success' : 'error';
    } else if (isString(status)) {
      realStatus = getStatus(status.toLowerCase());
    }
    return <Badge status={realStatus} text={text} style={this.getStyle()} />;
  }
}
