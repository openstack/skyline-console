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
import classnames from 'classnames';
import PropTypes from 'prop-types';
import centosIcon from 'asset/image/centos.svg';
import ubuntuIcon from 'asset/image/ubuntu.svg';
import fedoraIcon from 'asset/image/fedora.svg';
import windowsIcon from 'asset/image/windows.svg';
import debianIcon from 'asset/image/debian.svg';
import coreosIcon from 'asset/image/coreos.svg';
import archIcon from 'asset/image/arch.svg';
import freebsdIcon from 'asset/image/freebsd.svg';
import othersIcon from 'asset/image/others.svg';
import { Tooltip } from 'antd';
import styles from './index.less';

export default class index extends Component {
  static propTypes = {
    type: PropTypes.string,
    className: PropTypes.string,
    title: PropTypes.string,
  };

  static defaultProps = {
    className: '',
  };

  constructor(props) {
    super(props);
    this.icons = {
      centos: centosIcon,
      ubuntu: ubuntuIcon,
      fedora: fedoraIcon,
      windows: windowsIcon,
      debian: debianIcon,
      coreos: coreosIcon,
      arch: archIcon,
      freebsd: freebsdIcon,
      others: othersIcon,
    };
  }

  getImageSrc = () => {
    const { type } = this.props;
    return type ? this.icons[type.toLowerCase()] || othersIcon : othersIcon;
  };

  render() {
    const src = this.getImageSrc();
    const { type, className, title } = this.props;
    if (title) {
      return (
        <Tooltip title={title}>
          <img
            src={src}
            alt={title}
            className={classnames(styles.image, className)}
          />
        </Tooltip>
      );
    }
    return (
      <img
        src={src}
        alt={type}
        className={classnames(styles.image, className)}
      />
    );
  }
}
