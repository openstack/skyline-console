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
import overviewInstance from 'asset/cube/custom/icon-instance.png';
import overviewNetwork from 'asset/cube/custom/icon-networks.png';
import overviewRouter from 'asset/cube/custom/icon-router.png';
import overviewVolume from 'asset/cube/custom/icon-volumes.png';
import { Link } from 'react-router-dom';
import globalRootStore from 'stores/root';
import styles from './style.less';
import QuotaOverview from './components/QuotaOverview';
import ProjectInfo from './components/ProjectInfo';

const actions = [
  {
    key: 'instance',
    label: t('Instances'),
    avatar: overviewInstance,
    to: '/compute/instance',
  },
  {
    key: 'volume',
    label: t('Volumes'),
    avatar: overviewVolume,
    to: '/storage/volume',
  },
  {
    key: 'network',
    label: t('Networks'),
    avatar: overviewNetwork,
    to: '/network/networks',
  },
  {
    key: 'router',
    label: t('Routers'),
    avatar: overviewRouter,
    to: '/network/router',
  },
];

export class Overview extends Component {
  get filterActions() {
    if (!globalRootStore.checkEndpoint('cinder')) {
      return actions.filter((it) => it.key !== 'volume');
    }
    return actions;
  }

  get span() {
    if (!globalRootStore.checkEndpoint('cinder')) {
      return 8;
    }
    return 6;
  }

  renderAction = (item) => (
    <div className={styles['action-button']}>
      <img alt="avatar" src={item.avatar} className={styles['action-icon']} />
      <p className={styles['action-label']}>{item.label}</p>
    </div>
  );

  renderActions() {
    return this.filterActions.map((item) => (
      <Col span={this.span} key={item.key}>
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
          gutter={16}
          style={{ marginBottom: '16px' }}
        >
          {this.renderActions()}
        </Row>
        <Row gutter={16}>
          <Col span={16} className={styles.left}>
            {this.renderQuota()}
          </Col>
          <Col span={8} className={styles.right}>
            {this.renderProject()}
            {this.renderExtra()}
          </Col>
        </Row>
      </div>
    );
  }
}

export default observer(Overview);
