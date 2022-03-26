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
import Charts from 'components/PrometheusChart/component/Charts';
import { handleResponses } from 'components/PrometheusChart/utils/dataHandler';
import styles from './index.less';
import AlertInfo from './components/AlertInfo';
import {
  physicalNodeLeftTopCardList,
  physicalNodeRightTopCardList,
  storageLeftCardList,
  storageRightChartList,
  topCardList,
} from './config';

const BaseContentConfig = {
  renderNodeSelect: false,
  renderTimeRangeSelect: false,
};

const Index = () => {
  return (
    <BaseContent {...BaseContentConfig}>
      <Row gutter={[16, 16]} className={styles.container}>
        <Col span={24}>
          <AlertInfo />
        </Col>
        <Col span={24}>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Charts topCardList={physicalNodeLeftTopCardList} />
            </Col>
            <Col span={12}>
              <Charts topCardList={physicalNodeRightTopCardList} />
            </Col>
          </Row>
        </Col>
        <Col span={24}>
          <Charts
            baseTopCardProps={{
              span: 12,
              createFetchParams: {
                requestType: 'current',
              },
              handleDataParams: {
                formatDataFn: handleResponses,
              },
              visibleHeight: 200,
              renderContent: (store) => (
                <div className={styles['top-content']}>{store.data}</div>
              ),
            }}
            topCardList={topCardList}
          />
        </Col>
        <Col span={24}>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Charts topCardList={storageLeftCardList} />
            </Col>
            <Col span={12}>
              <Charts chartCardList={storageRightChartList} />
            </Col>
          </Row>
        </Col>
      </Row>
    </BaseContent>
  );
};

export default Index;
