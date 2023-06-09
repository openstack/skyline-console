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
import { Row, Col, Card, Descriptions, Progress, Avatar } from 'antd';
import { inject, observer } from 'mobx-react';
import styles from '../style.less';

export const resourceCircle = [
  {
    resource: 'vcpus',
    used: 'vcpus_used',
    label: t('CPU Usages (Core)'),
  },
  {
    resource: 'memory_mb',
    used: 'memory_mb_used',
    label: t('Memory Usages (GiB)'),
  },
];

export const color = {
  infoColor: globalCSS.primaryColor,
  warnColor: globalCSS.warnDarkColor,
  dangerColor: globalCSS.errorColor,
};

export class ResourceCircle extends Component {
  componentDidMount() {
    this.props.store.getVirtualResource();
  }

  get resourceCircle() {
    return this.props.resourceCircle || resourceCircle;
  }

  get resourceCircleSpan() {
    return this.props.resourceCircleSpan || 12;
  }

  renderCircle = (item, index) => {
    const { overview } = this.props.store;
    const resource = overview[item.resource];

    const used = overview[item.used];
    const percentNum = parseFloat(((used / resource) * 100).toFixed(2));
    const unUsed = parseFloat((resource - used).toFixed(2));
    let circleColor = color.infoColor;
    if (percentNum > 70) {
      circleColor = color.warnColor;
    }
    if (percentNum > 90) {
      circleColor = color.dangerColor;
    }
    return (
      <Col
        span={this.resourceCircleSpan}
        style={{ textAlign: 'center' }}
        key={`${resource}-${index}`}
      >
        <span className={styles.resource}>{item.label}</span>
        <Progress
          type="circle"
          width={150}
          percent={percentNum}
          strokeColor={circleColor}
          format={(percent) => `${percent}%`}
        />
        <Row className={styles.num}>
          <Col span={12} style={{ textAlign: 'right' }}>
            <Avatar
              shape="square"
              size={15}
              style={{
                marginBottom: 2,
                marginRight: 2,
                backgroundColor: circleColor,
              }}
            />
            {`${t('Used')}: ${used}`}
          </Col>
          <Col span={12} style={{ textAlign: 'left', paddingLeft: 20 }}>
            <Avatar
              shape="square"
              size={15}
              style={{
                marginBottom: 2,
                marginRight: 2,
                backgroundColor: '##A3A3A3',
              }}
            />
            {`${t('Unused')}: ${unUsed > 0 ? unUsed : '0'}`}
          </Col>
        </Row>
      </Col>
    );
  };

  render() {
    const { isLoading } = this.props.store;
    return (
      <Card
        loading={isLoading}
        className={styles.chart}
        title={t('Virtual Resources Used')}
        bordered={false}
      >
        <Descriptions column={1}>
          <div className="site-card-wrapper">
            <Row gutter={16}>
              {this.resourceCircle.map((item, index) => {
                return this.renderCircle(item, index);
              })}
            </Row>
          </div>
        </Descriptions>
      </Card>
    );
  }
}

export default inject('rootStore')(observer(ResourceCircle));
