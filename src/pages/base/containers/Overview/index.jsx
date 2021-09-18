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
import { observer } from 'mobx-react';
import { Row, Col } from 'antd';
import overviewInstance from 'asset/image/overview-instance.svg';
import overviewNetwork from 'asset/image/overview-network.svg';
import overviewRouter from 'asset/image/overview-router.svg';
import overviewVolume from 'asset/image/overview-volume.svg';
import { Link } from 'react-router-dom';
import styles from './style.less';
import QuotaOverview from './components/QuotaOverview';
import ProjectInfo from './components/ProjectInfo';

const actions = [
  {
    key: 'nstance',
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
    key: 'network',
    label: t('Network'),
    avatar: overviewNetwork,
    to: '/network/networks',
  },
  {
    key: 'router',
    label: t('Router'),
    avatar: overviewRouter,
    to: '/network/router',
  },
];

export class Overview extends Component {
  renderAction = (item) => (
    <Row className={styles.actionButton} gutter={[8]}>
      <Col span={8} className={styles.main_icon}>
        <img alt="avatar" src={item.avatar} className={styles.actionIcon} />
      </Col>
      <Col span={16} style={{ textAlign: 'center' }}>
        {item.label}
      </Col>
    </Row>
  );

  renderActions() {
    return actions.map((item) => (
      <Col span={6} key={item.key}>
        <Link to={item.to}>{this.renderAction(item)}</Link>
      </Col>
    ));
  }

  renderQuota() {
    return <QuotaOverview />;
  }

  renderProject() {
    return <ProjectInfo />;
  }

  renderExtra() {
    return null;
  }

  render() {
    return (
      <div className={styles.container}>
        <Row
          justify="space-between"
          gutter={[22, 22]}
          style={{ marginBottom: '22px' }}
        >
          {this.renderActions()}
        </Row>
        <Row gutter={16}>
          <Col span={16} className={styles.left}>
            {this.renderQuota()}
          </Col>
          <Col span={8} className={styles.right}>
            <ProjectInfo />
            {this.renderExtra()}
          </Col>
        </Row>
      </div>
    );
  }
}

export default observer(Overview);
