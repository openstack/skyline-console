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
// import cssModules from 'react-css-modules';
import { Row, Col } from 'antd';
import OverviewAdminStore from 'stores/overview-admin';
import styles from './style.less';
import PlatformInfo from './components/PlatformInfo';
import ComputeService from './components/ComputeService';
import NetworkService from './components/NetworkService';
import VirtualResource from './components/VirtualResource';
import ResourceOverview from './components/ResourceOverview';

@observer
class Overview extends Component {
  constructor(props) {
    super(props);
    this.adminStore = new OverviewAdminStore();
  }

  render() {
    return (
      <div className={styles.container}>
        <Row gutter={16} style={{ marginBottom: 22 }}>
          <Col span={24}>
            <PlatformInfo store={this.adminStore} />
          </Col>
        </Row>
        <Row gutter={16} style={{ marginBottom: 22 }}>
          <Col span={24}>
            <VirtualResource store={this.adminStore} />
          </Col>
        </Row>
        <Row gutter={16} style={{ marginBottom: 22 }}>
          <Col span={24}>
            <ResourceOverview store={this.adminStore} />
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12} className={styles.right}>
            <ComputeService store={this.adminStore} />
          </Col>
          <Col span={12} className={styles.right}>
            <NetworkService store={this.adminStore} />
          </Col>
        </Row>
      </div>
    );
  }
}

export default Overview;
