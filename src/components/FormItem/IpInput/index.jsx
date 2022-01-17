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
import { Input } from 'antd';
import PropTypes from 'prop-types';
import { ipValidate } from 'utils/validate';
import { sortBy } from 'lodash';
import styles from './index.less';

const { isIPv4 } = ipValidate;

export default class index extends Component {
  static propTypes = {
    value: PropTypes.string,
    version: PropTypes.number,
    onChange: PropTypes.func,
    defaultValue: PropTypes.string,
  };

  static defaultProps = {
    version: 4,
    defaultValue: '',
    onChange() {},
  };

  constructor(props) {
    super(props);
    const { value, version, defaultValue } = props;
    this.state = {
      value: this.getIpValues(defaultValue || value),
      version,
    };
  }

  componentDidUpdate() {
    const { disableNotice = false } = this.props;
    if (disableNotice) {
      return;
    }
    this.triggerChange();
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { version } = nextProps;
    // fix for re-render when changing ip-version
    if (version !== prevState.version) {
      return {
        version,
        value:
          version === 4
            ? [undefined, undefined, undefined, undefined]
            : undefined,
      };
    }
    return null;
  }

  triggerChange = () => {
    const { onChange, version } = this.props;
    const { value } = this.state;
    let ret;
    if (version === 4) {
      sortBy(value, (n) => n)[3] !== undefined && (ret = value.join('.'));
    } else {
      ret = value;
    }
    onChange && onChange(ret);
  };

  getIpValues = (value) => {
    const { version } = this.props;
    if (!value && version === 4) {
      const ip = [];
      for (let i = 0; i < 4; i++) {
        ip.push(undefined);
      }
      return ip;
    }
    if (isIPv4(value)) {
      return value.split('.').map((it) => Number.parseInt(it, 10));
    }
    return value;
  };

  // eslint-disable-next-line no-shadow
  onInputChange = (newVal, index) => {
    const { value } = this.state;
    let ipValue = Number.parseInt(newVal, 10);
    if (Number.isNaN(ipValue)) {
      ipValue = undefined;
    }
    if (ipValue < 0) {
      ipValue = 0;
    }
    if (ipValue > 255) {
      ipValue = 255;
    }
    value[index] = ipValue;
    this.setState(
      {
        value,
      },
      () => {
        this.triggerChange();
      }
    );
  };

  onInputChangeIPv6 = (value) => {
    this.setState(
      {
        value,
      },
      () => {
        this.triggerChange();
      }
    );
  };

  render() {
    const { value } = this.state;
    const { version } = this.props;
    if (version === 6) {
      return (
        <div>
          <Input
            value={value}
            className={styles.ipv6}
            onChange={(e) => {
              this.onInputChangeIPv6(e.currentTarget.value);
            }}
          />
        </div>
      );
    }
    // eslint-disable-next-line no-shadow
    const inputs = value.map((it, index) => (
      <div className={styles['item-wrapper']} key={`ip-input-${index}`}>
        <Input
          className={styles.item}
          value={value[index]}
          maxLength="3"
          onChange={(e) => {
            this.onInputChange(e.currentTarget.value, index);
          }}
        />
      </div>
    ));
    return <div className={styles['ip-input']}>{inputs}</div>;
  }
}
