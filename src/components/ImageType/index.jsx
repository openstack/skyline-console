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
import centosIcon from 'src/asset/image/centos.svg';
import ubuntuIcon from 'src/asset/image/ubuntu.svg';
import fedoraIcon from 'src/asset/image/fedora.svg';
import windowsIcon from 'src/asset/image/windows.svg';
import debianIcon from 'src/asset/image/debian.svg';
import coreosIcon from 'src/asset/image/coreos.svg';
import archIcon from 'src/asset/image/arch.svg';
import freebsdIcon from 'src/asset/image/freebsd.svg';
import othersIcon from 'src/asset/image/others.svg';
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
