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
import { upperFirst } from 'lodash';
import { Tooltip } from 'antd';
import centosIcon from 'asset/image/centos.svg';
import ubuntuIcon from 'asset/image/ubuntu.svg';
import fedoraIcon from 'asset/image/fedora.svg';
import windowsIcon from 'asset/image/windows.svg';
import debianIcon from 'asset/image/debian.svg';
import coreosIcon from 'asset/image/coreos.svg';
import archIcon from 'asset/image/arch.svg';
import freebsdIcon from 'asset/image/freebsd.svg';
import othersIcon from 'asset/image/others.svg';
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
      // The following two are for compatibility
      other: othersIcon,
      others: othersIcon,
    };
    this.titles = {
      centos: 'CentOS',
      ubuntu: 'Ubuntu',
      fedora: 'Fedora',
      windows: 'Windows',
      debian: 'Debian',
      coreos: 'CoreOS',
      arch: 'Arch',
      freebsd: 'FreeBSD',
      // The following two are for compatibility
      other: 'Others',
      others: 'Others',
    };
  }

  render() {
    const { type, className, title: titleProp } = this.props;

    const IconComponent = this.icons[type?.toLowerCase()] || othersIcon;

    const title =
      this.titles[titleProp?.toLowerCase()] || upperFirst(titleProp);

    const iconElement = (
      <IconComponent className={classnames(styles.image, className)} />
    );

    return title ? <Tooltip title={title}>{iconElement}</Tooltip> : iconElement;
  }
}
