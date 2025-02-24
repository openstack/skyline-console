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
import { Progress } from 'antd';
import { inject, observer } from 'mobx-react';
import CubeCard from 'components/cube/CubeCard';
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
      <div key={`${resource}-${index}`} className={styles['chart-container']}>
        <p className={styles['chart-title']}>{item.label}</p>
        <Progress
          type="circle"
          width={150}
          percent={percentNum}
          strokeColor={circleColor}
          format={(percent) => `${percent}%`}
        />
        <div className={styles['chart-indicator']}>
          <div className={styles['indivator-item-wrap']}>
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: 2,
                backgroundColor: circleColor,
              }}
            />
            {`${t('Used')}: ${used}`}
          </div>
          <div className={styles['indivator-item-wrap']}>
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: 2,
                backgroundColor: '#a9afbc',
              }}
            />
            {`${t('Unused')}: ${unUsed > 0 ? unUsed : '0'}`}
          </div>
        </div>
      </div>
    );
  };

  render() {
    const { isLoading } = this.props.store;
    return (
      <CubeCard loading={isLoading} title={t('Virtual Resources Used')}>
        <div className={styles['virtual-resources-used']}>
          {this.resourceCircle.map((item, index) => {
            return this.renderCircle(item, index);
          })}
        </div>
      </CubeCard>
    );
  }
}

export default inject('rootStore')(observer(ResourceCircle));
