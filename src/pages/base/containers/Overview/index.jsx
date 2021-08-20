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
// import { PropTypes } from 'prop-types';
import { observer } from 'mobx-react';
import { Row, Col } from 'antd';
import overviewInstance from 'src/asset/image/overview-instance.svg';
import overviewNetwork from 'src/asset/image/overview-network.svg';
import overviewRouter from 'src/asset/image/overview-router.svg';
import overviewVolume from 'src/asset/image/overview-volume.svg';
import { Link } from 'react-router-dom';
import styles from './style.less';
import QuotaOverview from './components/QuotaOverview';
import ProjectInfo from './components/ProjectInfo';

const actions = [
  {
    key: 'createInstance',
    label: t('Instance'),
    avatar: overviewInstance,
    to: '/compute/instance',
  },
  {
    key: 'volume',
    label: t('Volume'),
    avatar: overviewVolume,
    to: '/storage/volume',
  },
  {
    key: 'createNetwork',
    label: t('Network'),
    avatar: overviewNetwork,
    to: '/network/networks',
  },
  {
    key: 'createRouter',
    label: t('Router'),
    avatar: overviewRouter,
    to: '/network/router',
  },
];

@observer
class Overview extends Component {
  renderAction = (item) => (
    <Row className={styles.actionButton} gutter={[8]}>
      <Col span={12} className={styles.main_icon}>
        <img alt="avatar" src={item.avatar} className={styles.actionIcon} />
      </Col>
      <Col span={12} style={{ textAlign: 'center' }}>
        {item.label}
      </Col>
    </Row>
  );

  render() {
    return (
      <div className={styles.container}>
        <Row
          justify="space-between"
          gutter={[22, 22]}
          style={{ marginBottom: '22px' }}
        >
          {actions.map((item) => (
            <Col span={6} key={item.key}>
              <Link to={item.to}>{this.renderAction(item)}</Link>
            </Col>
          ))}
        </Row>
        <Row gutter={16}>
          <Col span={16} className={styles.left}>
            {/* <ResourceStatistic store={store} chartArray={chartArray} /> */}
            <QuotaOverview />
          </Col>
          <Col span={8} className={styles.right}>
            <ProjectInfo />
          </Col>
        </Row>
      </div>
    );
  }
}

export default Overview;
