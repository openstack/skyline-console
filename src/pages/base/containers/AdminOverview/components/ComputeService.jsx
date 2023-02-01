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
import { Row, Col, Card, Descriptions } from 'antd';
import { inject, observer } from 'mobx-react';
import {
  CheckCircleTwoTone,
  CloseCircleTwoTone,
} from '@ant-design/icons/lib/icons';
import { serviceState } from 'resources/nova/service';
import styles from '../style.less';

export class ComputeService extends Component {
  componentDidMount() {
    this.props.store.getComputeService();
  }

  renderAction = (item, index) => (
    <Row className={styles['sider-card']} key={`${item.binary}-${index}`}>
      <Col
        span={8}
        style={{ textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden' }}
      >
        {item.binary}
      </Col>
      <Col span={8} style={{ textAlign: 'center' }}>
        {item.host}
      </Col>
      <Col span={8} style={{ textAlign: 'center' }}>
        <span>{serviceState[item.state]}</span>
        {item.state === 'up' ? (
          <CheckCircleTwoTone
            style={{ marginLeft: 12 }}
            twoToneColor="#52c41a"
          />
        ) : (
          <CloseCircleTwoTone
            style={{ marginLeft: 12 }}
            twoToneColor="#ff4d4f"
          />
        )}
      </Col>
    </Row>
  );

  render() {
    const { computeServiceLoading, computeService = [] } = this.props.store;

    return (
      <Card
        loading={computeServiceLoading}
        className={styles.top}
        title={t('Compute Service')}
        bordered={false}
      >
        <Descriptions column={1}>
          <div className="site-card-wrapper">
            {computeService.map((item, index) =>
              this.renderAction(item, index)
            )}
          </div>
        </Descriptions>
      </Card>
    );
  }
}

ComputeService.propTypes = {
  store: PropTypes.object.isRequired,
};

export default inject('rootStore')(observer(ComputeService));
