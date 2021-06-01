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
import { Badge, Row, Col, Card, Descriptions } from 'antd';
import { inject, observer } from 'mobx-react';
import adminInstance from 'src/asset/image/adminInstance.svg';
import adminVolume from 'src/asset/image/adminVolume.svg';
import { Link } from 'react-router-dom';
import adminNetwork from 'src/asset/image/adminNetwork.svg';
import adminImage from 'src/asset/image/adminImage.svg';
import adminSecurityGroup from 'src/asset/image/adminSecurityGroup.svg';
import adminRouter from 'src/asset/image/adminRouter.svg';
import styles from '../style.less';

const card = [
  {
    key: 'serviceNum',
    label: t('Instance'),
    avatar: adminInstance,
    to: '/compute/instance-admin',
  },
  {
    key: 'volumeNum',
    label: t('Volume'),
    avatar: adminVolume,
    to: '/storage/volume-admin',
  },
];

const smallCard = [
  {
    key: 'networkNum',
    label: t('Network'),
    avatar: adminNetwork,
    to: '/network/networks-admin',
  },
  {
    key: 'imageNum',
    label: t('Image'),
    avatar: adminImage,
    to: '/compute/image-admin',
  },
  {
    key: 'routerNum',
    label: t('Router'),
    avatar: adminRouter,
    to: '/network/router-admin',
  },
  {
    key: 'securityGroupNum',
    label: t('Security Group'),
    avatar: adminSecurityGroup,
    to: '/network/security-group-admin',
  },
];

const instanceColors = {
  active: { color: '#52C41A', text: t('Active Status') },
  error: { color: '#E8684A', text: t('Error') },
  shutoff: { color: '#E6F2E0', text: t('Shutoff') },
  other: { color: '#F6B23D', text: t('Others') },
};

const volumeColors = {
  active: { color: '#52C41A', text: t('Attaching') },
  error: { color: '#E8684A', text: t('Error') },
  unattache: { color: '#E6F2E0', text: t('Unattached') },
  other: { color: '#F6B23D', text: t('Others') },
};

@inject('rootStore')
@observer
class virtualResourceInfo extends Component {
  componentDidMount() {
    this.props.store.getVirtualResource();
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
    // resource === 'serviceNum'
    return Object.keys(colors).map((key) => (
      <Col span={12} key={key} className={styles.status}>
        <Badge color={colors[key].color} text={colors[key].text} />
        {resource ? resource[key] : 0}
      </Col>
    ));
  }

  renderCard() {
    const { virtualResource } = this.props.store;
    return (
      <Row>
        {card.map((item) => (
          <Col span={12} style={{ textAlign: 'center' }} key={item.key}>
            <Card className={styles.card}>
              <Link to={item.to} style={{ color: '#000000' }}>
                <Row>
                  <Col span={8} style={{ textAlign: 'center' }}>
                    <img
                      alt="avatar"
                      src={item.avatar}
                      style={{ paddingTop: '14px' }}
                    />
                  </Col>
                  <Col span={16} style={{ textAlign: 'left' }}>
                    <span className={styles.label}>{item.label}</span>
                    <span className={styles.all}>
                      {virtualResource[item.key]
                        ? virtualResource[item.key].all
                        : null}
                    </span>
                    <Row>
                      {virtualResource[item.key]
                        ? this.renderStatusColor(
                            virtualResource[item.key],
                            item.key
                          )
                        : null}
                    </Row>
                  </Col>
                </Row>
              </Link>
            </Card>
          </Col>
        ))}
      </Row>
    );
  }

  renderSmallCard() {
    const { virtualResource } = this.props.store;
    return (
      <Row style={{ marginTop: '14px' }}>
        {smallCard.map((item) => (
          <Col span={6} style={{ textAlign: 'center' }} key={item.key}>
            <Card className={styles.card}>
              <Link to={item.to} style={{ color: '#000000' }}>
                <Row>
                  <Col span={12} style={{ textAlign: 'center' }}>
                    <img alt="avatar" src={item.avatar} />
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
      <Card
        loading={virtualResourceLoading}
        className={styles.resourceOverview}
        title={t('Virtual Resource Overview')}
        bordered={false}
      >
        <Descriptions column={1}>
          <div className="site-card-wrapper">
            {this.renderCard()}
            {/* {this.renderSmallCard()} */}
          </div>
        </Descriptions>
      </Card>
    );
  }
}

virtualResourceInfo.propTypes = {
  store: PropTypes.object.isRequired,
};

export default virtualResourceInfo;
