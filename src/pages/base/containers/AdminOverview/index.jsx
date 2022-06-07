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
import OverviewAdminStore from 'stores/overview-admin';
import globalServerStore from 'stores/nova/server';
import globalHypervisorStore from 'stores/nova/hypervisor';
import styles from './style.less';
import PlatformInfo from './components/PlatformInfo';
import ComputeService from './components/ComputeService';
import NetworkService from './components/NetworkService';
import VirtualResource from './components/VirtualResource';
import ResourceOverview from './components/ResourceOverview';

export class Overview extends Component {
  constructor(props) {
    super(props);
    this.adminStore = new OverviewAdminStore();
  }

  renderPlatformInfo() {
    return <PlatformInfo store={this.adminStore} />;
  }

  renderVirtualResource() {
    return <VirtualResource store={globalHypervisorStore} />;
  }

  renderResourceOverview() {
    return <ResourceOverview store={globalServerStore} />;
  }

  renderComputeService() {
    return <ComputeService store={this.adminStore} />;
  }

  renderNetworkService() {
    return <NetworkService store={this.adminStore} />;
  }

  render() {
    return (
      <div className={styles.container}>
        <Row gutter={16} style={{ marginBottom: 22 }}>
          <Col span={24}>{this.renderPlatformInfo()}</Col>
        </Row>
        <Row gutter={16} style={{ marginBottom: 22 }}>
          <Col span={24}>{this.renderVirtualResource()}</Col>
        </Row>
        <Row gutter={16} style={{ marginBottom: 22 }}>
          <Col span={24}>{this.renderResourceOverview()}</Col>
        </Row>
        <Row gutter={16}>
          <Col span={12} className={styles.right}>
            {this.renderComputeService()}
          </Col>
          <Col span={12} className={styles.right}>
            {this.renderNetworkService()}
          </Col>
        </Row>
      </div>
    );
  }
}

export default observer(Overview);
