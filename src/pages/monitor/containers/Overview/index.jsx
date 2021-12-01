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

import React from 'react';
import BaseContent from 'components/PrometheusChart/component/BaseContent';
import { Col, Row } from 'antd';
import styles from './index.less';
import AlertInfo from './components/AlertInfo';
import ClusterCard from './components/ClusterMonitor/ClusterCard';
import ClusterChart from './components/ClusterMonitor/ClusterChart';
import TopCard from './components/Tops/TopCard';
import StorageClusterCard from './components/StorageClusterMonitor/StorageClusterCard';
import StorageClusterChart from './components/StorageClusterMonitor/StorageClusterChart';

const BaseContentConfig = {
  renderNodeSelect: false,
  renderTimeRangeSelect: false,
};

const Index = () => {
  return (
    <BaseContent
      {...BaseContentConfig}
      renderChartCards={(store) => (
        <Row gutter={[16, 16]} className={styles.container}>
          <Col span={24}>
            <AlertInfo />
          </Col>
          <Col span={24}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <ClusterCard store={store} />
              </Col>
              <Col span={12}>
                <ClusterChart store={store} />
              </Col>
            </Row>
          </Col>
          <Col span={24}>
            <TopCard store={store} />
          </Col>
          <Col span={24}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <StorageClusterCard store={store} />
              </Col>
              <Col span={12}>
                <StorageClusterChart
                  store={store}
                  BaseContentConfig={BaseContentConfig}
                />
              </Col>
            </Row>
          </Col>
        </Row>
      )}
    />
  );
};

export default Index;
