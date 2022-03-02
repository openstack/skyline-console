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
import { Badge, Card, Col, List, Progress, Row, Spin, Tooltip } from 'antd';
import { inject, observer } from 'mobx-react';
import globalVolumeTypeStore from 'stores/cinder/volume-type';
import globalProjectStore from 'stores/keystone/project';
import { isNumber } from 'lodash';
import styles from '../style.less';

const colors = {
  normal: { color: '#4CC9F0', text: t('Normal') },
  danger: { color: '#4361EE', text: t('Danger') },
  full: { color: '#E8684A', text: t('Full') },
};

export const quotaCardList = [
  {
    text: t('Compute'),
    type: 'compute',
    value: [
      { text: t('Instances'), key: 'instances' },
      { text: t('vCPUs'), key: 'cores' },
      { text: t('Memory'), key: 'ram' },
      { text: t('Key Pair'), key: 'key_pairs' },
      { text: t('Server Group'), key: 'server_groups' },
    ],
  },
  {
    text: t('Storage'),
    type: 'storage',
    value: [
      {
        text: t('volumes'),
        key: 'volumes',
      },
      {
        text: t('Gigabytes(GB)'),
        key: 'gigabytes',
      },
      {
        text: t('Snapshots'),
        key: 'snapshots',
      },
      {
        text: t('backups'),
        key: 'backups',
      },
      {
        text: t('backup gigabytes (GiB)'),
        key: 'backup_gigabytes',
      },
    ],
  },
  {
    text: t('Network'),
    type: 'networks',
    value: [
      { text: t('Router'), key: 'router' },
      { text: t('Network'), key: 'network' },
      { text: t('Subnet'), key: 'subnet' },
      { text: t('Floating IP'), key: 'floatingip' },
      { text: t('Port'), key: 'port' },
      { text: t('Security Group'), key: 'security_group' },
      { text: t('Security Group Rule'), key: 'security_group_rule' },
    ],
  },
];

export const getVolumeTypeCards = (data) => {
  const value = data.map((item, index) => {
    return {
      index,
      value: [
        {
          text: t('{name} type', { name: item.name }),
          key: `volumes_${item.name}`,
        },
        {
          text: t('{name} type gigabytes(GB)', { name: item.name }),
          key: `gigabytes_${item.name}`,
        },
        {
          text: t('{name} type snapshots', { name: item.name }),
          key: `snapshots_${item.name}`,
        },
      ],
    };
  });
  return {
    text: t('Storage Types'),
    type: 'volumeTypes',
    value,
  };
};

export class QuotaOverview extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
    };
    const { projectStore, volumeTypeStore } = props;
    this.projectStore = projectStore || globalProjectStore;
    this.volumeTypeStore = volumeTypeStore || globalVolumeTypeStore;
  }

  componentDidMount() {
    this.getData();
  }

  async getData() {
    const { getData } = this.props;
    if (getData) {
      await getData();
    } else {
      const { user } = this.props.rootStore;
      const { project: { id: projectId = '' } = {} } = user;
      await Promise.all([
        this.projectStore.fetchProjectQuota({ project_id: projectId }),
        this.volumeTypeStore.fetchList(),
      ]);
    }
    this.setState({
      isLoading: false,
    });
  }

  get volumeTypeData() {
    const { volumeTypeData } = this.props;
    return volumeTypeData || this.volumeTypeStore.list.data;
  }

  get volumeTypesQuota() {
    return getVolumeTypeCards(this.volumeTypeData);
  }

  get quotaCardList() {
    return this.props.quotaCardList || quotaCardList;
  }

  get quotaAction() {
    return this.props.quotaAction;
  }

  getFilteredValue = (value) => value.filter((it) => !it.hidden);

  getItemInfo = (data, i) => {
    let percent = 0;
    if (data[i.key] && isNumber(data[i.key].used) && data[i.key].limit !== -1) {
      percent = (data[i.key].used / data[i.key].limit) * 100;
    }
    let used = '-';
    if (data[i.key] && isNumber(data[i.key].used)) {
      used = `${data[i.key].used} / ${
        data[i.key].limit === -1 ? t('Unlimit') : data[i.key].limit
      }`;
    }

    const strokeColor =
      (percent >= 90 && colors.full.color) ||
      (percent >= 80 && colors.danger.color) ||
      colors.normal.color;
    let title = `${i.text} : ${used}`;
    const { server_group_members } = data;
    if (i.key === 'server_groups' && server_group_members) {
      title = `${title}   (${t('Member in group')} : ${
        server_group_members.limit === -1
          ? t('Unlimit')
          : server_group_members.limit
      })`;
    }
    return (
      <>
        <Tooltip title={title}>
          <div className={styles['progress-title']}>{title}</div>
        </Tooltip>
        <Progress
          style={{ marginTop: 13, marginBottom: 13 }}
          percent={percent}
          showInfo={false}
          strokeColor={strokeColor}
        />
      </>
    );
  };

  renderQuotaCardList = () => {
    const { isLoading } = this.state;
    return (
      <Row className={styles.content}>
        {this.quotaCardList.map((item) => (
          <Col className={styles.card} span={12} key={item.type}>
            <Card title={item.text} bordered={false} loading={isLoading}>
              {this.renderQuotaCardContent(item)}
            </Card>
          </Col>
        ))}
        <Col className={styles.card} span={24} key={this.volumeTypesQuota.type}>
          <Card
            title={this.volumeTypesQuota.text}
            bordered={false}
            loading={isLoading}
          >
            {this.renderVolumeTypes()}
          </Card>
        </Col>
      </Row>
    );
  };

  renderQuotaCardContent(item) {
    const { isLoading } = this.state;
    if (isLoading) {
      return <Spin />;
    }
    return this.renderQuotaCart(
      this.projectStore.quota,
      this.getFilteredValue(item.value)
    );
  }

  renderQuotaCart = (data, item = []) =>
    item.map((i) => <div key={i.text}>{this.getItemInfo(data, i)}</div>);

  renderVolumeTypes = () => {
    const { isLoading } = this.state;
    if (isLoading) {
      return <Spin />;
    }
    return (
      <List
        itemLayout="vertical"
        size="large"
        pagination={{
          hideOnSinglePage: true,
          pageSize: 5,
          size: 'small',
        }}
        dataSource={this.volumeTypesQuota.value}
        renderItem={(item) => (
          <Row key={item.index} gutter={[16]}>
            {item.value.map((i) => (
              <Col span={8} key={i.text}>
                {this.getItemInfo(this.projectStore.quota, i)}
              </Col>
            ))}
          </Row>
        )}
      />
    );
  };

  render() {
    const { isLoading } = this.state;
    return (
      <Card
        className={styles.bottom}
        bodyStyle={{ padding: 0 }}
        loading={isLoading}
        title={
          <div className={styles.title}>
            <span className={styles.text}>{t('Quota Overview')}</span>
            {Object.keys(colors).map((key) => (
              <span key={key} className={styles.badge}>
                <Badge color={colors[key].color} text={colors[key].text} />
              </span>
            ))}
          </div>
        }
        extra={this.quotaAction}
      >
        {this.renderQuotaCardList()}
      </Card>
    );
  }
}

export default inject('rootStore')(observer(QuotaOverview));
