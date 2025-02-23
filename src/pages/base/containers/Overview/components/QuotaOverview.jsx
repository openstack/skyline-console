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
import { Badge, Col, List, Progress, Row, Spin, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { inject, observer } from 'mobx-react';
import globalVolumeTypeStore from 'stores/cinder/volume-type';
import globalProjectStore from 'stores/keystone/project';
import globalRootStore from 'stores/root';
import { firewallEndpoint } from 'client/client/constants';
import { isNumber } from 'lodash';
import CubeCard from 'components/cube/CubeCard';
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
      <p className={styles['label-text']}>
        {i.text} : <span className={styles.usage}>{used}</span>
      </p>
    );

    const { server_group_members } = data;

    if (i.key === 'server_groups' && server_group_members) {
      title = (
        <p className={styles['label-text']}>
          {title} ({t('Members of Each Group')} :{' '}
          <span className={styles.usage}>
            {server_group_members.limit === -1
              ? t('Unlimit')
              : server_group_members.limit}
            )
          </span>
        </p>
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
            style={{ marginTop: 4, marginBottom: 4 }}
            percent={percent}
            showInfo={false}
            strokeColor={strokeColor}
          />
        </Tooltip>
      </>
    );
  };

  renderQuotaCardList = () => {
    return (
      <Row className={styles.content}>
        {this.quotaCardList.map((item) => (
          <div key={item.type} className={styles['quota-card']}>
            <div className={styles['card-title']}>{item.text}</div>
            <div
              className={styles['card-content']}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: '16px',
              }}
            >
              {this.renderQuotaCardContent(item)}
            </div>
          </div>
        ))}
        {this.enableCinder ? (
          <div
            key={this.volumeTypesQuota.type}
            className={styles['quota-card']}
          >
            <div className={styles['card-title']}>
              {this.volumeTypesQuota.text}
            </div>
            <div className={styles['card-content']}>
              {this.renderVolumeTypes()}
            </div>
          </div>
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
      <div key={i.text} className={styles['quota-column-container']}>
        <div className={styles['quota-column']}>
          {this.getItemInfo(data, i)}
        </div>
      </div>
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
        className={styles['quota-column-container']}
        renderItem={(item) => (
          <Row key={item.index} gutter={[16]}>
            {item.value.map((i) => (
              <Col span={8} key={i.text} className={styles['quota-column']}>
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
      <CubeCard
        loading={isLoading}
        title={
          <div style={{ display: 'flex', gap: '24px' }}>
            {t('Quota Overview')}
            <div style={{ display: 'flex', gap: '16px' }}>
              {Object.keys(colors).map((key) => (
                <Badge
                  key={key}
                  color={colors[key].color}
                  text={colors[key].text}
                />
              ))}
            </div>
          </div>
        }
        extra={this.quotaAction}
      >
        {this.renderQuotaCardList()}
      </CubeCard>
    );
  }
}

export default inject('rootStore')(observer(QuotaOverview));
