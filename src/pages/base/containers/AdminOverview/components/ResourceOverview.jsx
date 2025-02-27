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
import { Link } from 'react-router-dom';
import { Badge, Row, Col, Card } from 'antd';
import { inject, observer } from 'mobx-react';
import adminInstance from 'asset/cube/custom/icon-instance.png';
import adminVolume from 'asset/cube/custom/icon-volumes.png';
import AdminNetwork from 'asset/image/admin-network.svg';
import AdminImage from 'asset/image/admin-image.svg';
import AdminSecurityGroup from 'asset/image/admin-security-group.svg';
import AdminRouter from 'asset/image/admin-router.svg';
import CubeCard from 'components/cube/CubeCard';
import styles from '../style.less';

export const card = [
  {
    key: 'serviceNum',
    label: t('Instances'),
    avatar: adminInstance,
    to: '/compute/instance-admin',
  },
  {
    key: 'volumeNum',
    label: t('Volumes'),
    avatar: adminVolume,
    to: '/storage/volume-admin',
  },
];

export const smallCard = [
  {
    key: 'networkNum',
    label: t('Network'),
    Avatar: AdminNetwork,
    to: '/network/networks-admin',
  },
  {
    key: 'imageNum',
    label: t('Image'),
    Avatar: AdminImage,
    to: '/compute/image-admin',
  },
  {
    key: 'routerNum',
    label: t('Router'),
    Avatar: AdminRouter,
    to: '/network/router-admin',
  },
  {
    key: 'securityGroupNum',
    label: t('Security Group'),
    Avatar: AdminSecurityGroup,
    to: '/network/security-group-admin',
  },
];

const instanceColors = {
  active: { color: globalCSS.successColor, text: t('Active Status') },
  error: { color: globalCSS.errorColor, text: t('Error') },
  shutoff: { color: '#D7D9E7', text: t('Shutoff') },
  other: { color: globalCSS.warnLightColor, text: t('Others') },
};

const volumeColors = {
  active: { color: globalCSS.successColor, text: t('Attaching') },
  error: { color: globalCSS.errorColor, text: t('Error') },
  available: { color: '#D7D9E7', text: t('Unattached') },
  other: { color: globalCSS.warnLightColor, text: t('Others') },
};

export class virtualResourceInfo extends Component {
  componentDidMount() {
    this.props.store.getVirtualResourceOverview();
  }

  get card() {
    const list = this.props.card || card;
    if (!this.props.rootStore.checkEndpoint('cinder')) {
      return list.filter((it) => it.key !== 'volumeNum');
    }
    return list;
  }

  get smallCard() {
    return this.props.smallCard || smallCard;
  }

  renderStatusColor(resource, resourceKey) {
    let colors = null;
    switch (resourceKey) {
      case 'volumeNum':
        colors = volumeColors;
        break;
      default:
        colors = instanceColors;
        break;
    }

    return (
      <div className={styles['overview-indicator']} style={{ display: 'flex' }}>
        {Object.keys(colors).map((key) => (
          <div key={key} className={styles.status}>
            <Badge color={colors[key].color} text={colors[key].text} />
            <p>{resource ? resource[key] : 0}</p>
          </div>
        ))}
      </div>
    );
  }

  renderCard() {
    const { virtualResource } = this.props.store;
    return (
      <div className={styles['virtual-resources-overview']}>
        {this.card.map((item) => (
          <Link key={item.key} to={item.to} className={styles['overview-link']}>
            <div className={styles['overview-info']}>
              <img src={item.avatar} alt="icon" width={80} height={80} />
              <div className={styles['info-text']}>
                <div className={styles['info-number']}>
                  {virtualResource[item.key]
                    ? virtualResource[item.key].all
                    : null}
                </div>
                <div className={styles['info-label']}>{item.label}</div>
              </div>
            </div>
            <div className={styles['overview-indicator']}>
              {virtualResource[item.key]
                ? this.renderStatusColor(virtualResource[item.key], item.key)
                : null}
            </div>
          </Link>
        ))}
      </div>
    );
  }

  renderSmallCard() {
    const { virtualResource } = this.props.store;
    return (
      <Row style={{ marginTop: '14px' }}>
        {this.smallCard.map((item) => (
          <Col span={6} style={{ textAlign: 'center' }} key={item.key}>
            <Card className={styles.card}>
              <Link to={item.to} style={{ color: '#000000' }}>
                <Row>
                  <Col span={12} style={{ textAlign: 'center' }}>
                    <item.Avatar />
                  </Col>
                  <Col span={12} style={{ textAlign: 'left' }}>
                    <span className={styles.label}>{item.label}</span>
                    <span className={styles.all}>
                      {virtualResource[item.key]}
                    </span>
                  </Col>
                </Row>
              </Link>
            </Card>
          </Col>
        ))}
      </Row>
    );
  }

  render() {
    const { virtualResourceLoading } = this.props.store;
    return (
      <CubeCard
        loading={virtualResourceLoading}
        className={styles['resource-overview']}
        title={t('Virtual Resource Overview')}
        bordered={false}
      >
        {this.renderCard()}
      </CubeCard>
    );
  }
}

virtualResourceInfo.propTypes = {
  store: PropTypes.object.isRequired,
};

export default inject('rootStore')(observer(virtualResourceInfo));
