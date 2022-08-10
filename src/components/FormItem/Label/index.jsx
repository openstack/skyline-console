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
import imageSvg from 'asset/image/image.svg';
import securityImg from 'asset/image/security-group.svg';
import lbImg from 'asset/image/load-balancer.png';

import {
  DesktopOutlined,
  BorderOuterOutlined,
  SecurityScanOutlined,
  InboxOutlined,
  GlobalOutlined,
  GatewayOutlined,
  UserOutlined,
  CameraOutlined,
  SaveOutlined,
  KeyOutlined,
  ClusterOutlined,
  TagOutlined,
  HddOutlined,
  CloudServerOutlined,
  LoadingOutlined,
  TeamOutlined,
  ProjectOutlined,
  AimOutlined,
} from '@ant-design/icons';
import styles from './index.less';

const ImageIcon = (
  <img src={imageSvg} alt="image_icon" style={{ width: '12px' }} />
);

const SecurityIcon = (
  <img src={securityImg} alt="security_icon" style={{ width: '12px' }} />
);

const LBIcon = <img src={lbImg} alt="lb_icon" style={{ width: '12px' }} />;

const iconTypeMap = {
  instance: <DesktopOutlined />,
  router: <BorderOuterOutlined />,
  externalNetwork: <GlobalOutlined />,
  network: <GlobalOutlined />,
  firewall: <SecurityScanOutlined />,
  volume: <InboxOutlined />,
  gateway: <GatewayOutlined />,
  user: <UserOutlined />,
  snapshot: <CameraOutlined />,
  backup: <SaveOutlined />,
  keypair: <KeyOutlined />,
  image: ImageIcon,
  aggregate: <ClusterOutlined />,
  metadata: <TagOutlined />,
  flavor: <HddOutlined />,
  host: <CloudServerOutlined />,
  security: SecurityIcon,
  lb: LBIcon,
  group: <TeamOutlined />,
  project: <ProjectOutlined />,
  floatingIp: <AimOutlined />,
};

export default class index extends Component {
  static propTypes = {
    content: PropTypes.any,
    value: PropTypes.any,
    icon: PropTypes.node,
    iconType: PropTypes.string,
  };

  static defaultProps = {
    icon: null,
    iconType: '',
    content: '',
    value: null,
  };

  renderIcon() {
    const { icon, iconType } = this.props;
    if (iconType) {
      const iconComp = iconTypeMap[iconType] || null;
      return <span className={styles.icon}>{iconComp}</span>;
    }
    return <span className={styles.icon}>{icon || null}</span>;
  }

  render() {
    const { content, value, iconType, showLoading, ...rest } = this.props;
    const failValues = [undefined, null, ''];
    if (content) {
      return content;
    }
    return (
      <span {...rest}>
        {this.renderIcon()}
        {showLoading && failValues.includes(value) ? (
          <LoadingOutlined />
        ) : (
          value
        )}
      </span>
    );
  }
}
