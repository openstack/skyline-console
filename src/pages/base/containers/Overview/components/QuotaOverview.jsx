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
import { QuestionCircleOutlined } from '@ant-design/icons';
import { inject, observer } from 'mobx-react';
import globalVolumeTypeStore from 'stores/cinder/volume-type';
import globalProjectStore from 'stores/keystone/project';
import globalRootStore from 'stores/root';
import { firewallEndpoint } from 'client/client/constants';
import { isNumber } from 'lodash';
import styles from '../style.less';

const colors = {
  normal: { color: globalCSS.primaryColor, text: t('Normal') },
  danger: { color: globalCSS.warnDarkColor, text: t('Danger') },
  full: { color: globalCSS.errorColor, text: t('Full') },
};

const keyPairTitle = (
  <span>
    {t('Key Pairs')}
    <Tooltip title={t('The number of allowed key pairs for each user.')}>
      <QuestionCircleOutlined style={{ marginLeft: 4 }} />
    </Tooltip>
  </span>
);

const firewallQuota = firewallEndpoint()
  ? [
      {
        text: t('Firewalls'),
        key: 'firewall_group',
      },
      {
        text: t('Firewall Policies'),
        key: 'firewall_policy',
      },
      {
        text: t('Firewall Rules'),
        key: 'firewall_rule',
      },
    ]
  : [];

export const quotaCardList = [
  {
    text: t('Compute'),
    type: 'compute',
    value: [
      { text: t('Instances'), key: 'instances' },
      { text: t('vCPUs'), key: 'cores' },
      { text: t('Memory (GiB)'), key: 'ram' },
      { text: keyPairTitle, key: 'key_pairs' },
      { text: t('Server Groups'), key: 'server_groups' },
    ],
  },
  {
    text: t('Storage'),
    type: 'storage',
    value: [
      {
        text: t('Volumes'),
        key: 'volumes',
      },
      {
        text: t('Volume Capacity (GiB)'),
        key: 'gigabytes',
      },
      {
        text: t('Volume Snapshots'),
        key: 'snapshots',
      },
      {
        text: t('Volume Backups'),
        key: 'backups',
      },
      {
        text: t('Volume Backup Capacity (GiB)'),
        key: 'backup_gigabytes',
      },
    ],
  },
  {
    text: t('Network'),
    type: 'networks',
    value: [
      { text: t('Routers'), key: 'router' },
      { text: t('Networks'), key: 'network' },
      { text: t('Subnets'), key: 'subnet' },
      { text: t('Floating IPs'), key: 'floatingip' },
      { text: t('Ports'), key: 'port' },
      { text: t('Security Groups'), key: 'security_group' },
      { text: t('Security Group Rules'), key: 'security_group_rule' },
      ...firewallQuota,
    ],
  },
];

export const shareQuotaCard = {
  text: t('Share'),
  type: 'share',
  value: [
    { text: t('Shares'), key: 'shares' },
    {
      text: t('Share Capacity (GiB)'),
      key: 'share_gigabytes',
    },
    { text: t('Share Networks'), key: 'share_networks' },
    { text: t('Share Groups'), key: 'share_groups' },
  ],
};

export const zunQuotaCard = {
  text: t('Containers Management'),
  type: 'zun',
  value: [
    {
      text: t('Containers'),
      key: 'zun_containers',
    },
    { text: t('Containers CPU'), key: 'zun_cpu' },
    { text: t('Containers Memory (MiB)'), key: 'zun_memory' },
    { text: t('Containers Disk (GiB)'), key: 'zun_disk' },
  ],
};

export const magnumQuotaCard = {
  text: t('Clusters Management'),
  type: 'magnum',
  value: [
    {
      text: t('Clusters'),
      key: 'magnum_cluster',
    },
  ],
};

export const troveQuotaCard = {
  text: t('Database'),
  type: 'trove',
  value: [
    {
      text: t('Database Instance'),
      key: 'trove_instances',
    },
    {
      text: t('Database Disk (GiB)'),
      key: 'trove_volumes',
    },
  ],
};

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
          text: t('{name} type capacity (GiB)', { name: item.name }),
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
      const promiseArr = [
        this.projectStore.fetchProjectQuota({
          project_id: projectId,
          withKeyPair: true,
        }),
      ];
      if (this.enableCinder) {
        promiseArr.push(this.volumeTypeStore.fetchList());
      }
      await Promise.all(promiseArr);
    }
    this.setState({
      isLoading: false,
    });
  }

  get enableCinder() {
    return globalRootStore.checkEndpoint('cinder');
  }

  get enableShare() {
    return globalRootStore.checkEndpoint('manilav2');
  }

  get enableZun() {
    return globalRootStore.checkEndpoint('zun');
  }

  get enableMagnum() {
    return globalRootStore.checkEndpoint('magnum');
  }

  get enableTrove() {
    return (
      globalRootStore.checkEndpoint('trove') && globalRootStore.hasAdminOnlyRole
    );
  }

  get volumeTypeData() {
    const { volumeTypeData } = this.props;
    return volumeTypeData || this.volumeTypeStore.list.data;
  }

  get volumeTypesQuota() {
    return getVolumeTypeCards(this.volumeTypeData);
  }

  get quotaCardList() {
    const list = this.props.quotaCardList || quotaCardList;
    let newList = [...list];
    if (!this.enableCinder) {
      newList = newList.filter((it) => it.type !== 'storage');
    }
    if (this.enableShare) {
      newList.push(shareQuotaCard);
    }
    if (this.enableZun) {
      newList.push(zunQuotaCard);
    }
    if (this.enableMagnum) {
      newList.push(magnumQuotaCard);
    }
    if (this.enableTrove) {
      newList.push(troveQuotaCard);
    }
    return newList;
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
    let title = (
      <span>
        {i.text} : {used}
      </span>
    );
    const { server_group_members } = data;
    if (i.key === 'server_groups' && server_group_members) {
      title = (
        <span>
          {title} ({t('Members of Each Group')} :
          {server_group_members.limit === -1
            ? t('Unlimit')
            : server_group_members.limit}
          )
        </span>
      );
    }
    return (
      <>
        <div className={styles['progress-title']}>{title}</div>
        <Tooltip
          title={title}
          placement="top"
          getPopupContainer={(node) => node.parentNode}
        >
          <Progress
            style={{ marginTop: 13, marginBottom: 13 }}
            percent={percent}
            showInfo={false}
            strokeColor={strokeColor}
          />
        </Tooltip>
      </>
    );
  };

  renderQuotaCardList = () => {
    const { isLoading } = this.state;
    return (
      <Row className={styles.content}>
        {this.quotaCardList.map((item) => (
          <Col className={styles.card} span={24} key={item.type}>
            <Card
              title={item.text}
              bordered={false}
              loading={isLoading}
              size="small"
            >
              <Row gutter={24}>{this.renderQuotaCardContent(item)}</Row>
            </Card>
          </Col>
        ))}
        {this.enableCinder ? (
          <Col
            className={styles.card}
            span={24}
            key={this.volumeTypesQuota.type}
          >
            <Card
              title={this.volumeTypesQuota.text}
              bordered={false}
              loading={isLoading}
              size="small"
            >
              {this.renderVolumeTypes()}
            </Card>
          </Col>
        ) : null}
      </Row>
    );
  };

  renderQuotaCardContent(item) {
    const { isLoading } = this.state;
    if (isLoading) {
      return <Spin />;
    }
    return this.renderQuotaCard(
      this.projectStore.quota,
      this.getFilteredValue(item.value)
    );
  }

  renderQuotaCard = (data, item = []) =>
    item.map((i) => (
      <Col key={i.text} span={12}>
        {this.getItemInfo(data, i)}
      </Col>
    ));

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
        headStyle={{ paddingLeft: '20px' }}
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
