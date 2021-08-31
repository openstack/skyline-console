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
import globalKeypairStore from 'stores/nova/keypair';
import globalProjectStore from 'stores/keystone/project';
import { isNumber } from 'lodash';
import styles from '../style.less';

const colors = {
  normal: { color: '#4CC9F0', text: t('Normal') },
  danger: { color: '#4361EE', text: t('Danger') },
  full: { color: '#E8684A', text: t('Full') },
};

class QuotaOverview extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
    };
  }

  componentDidMount() {
    this.getData();
  }

  getData = async () => {
    const { user } = this.props.rootStore;
    const { project: { id: projectId = '' } = {} } = user;
    await globalProjectStore.fetchProjectQuota({ project_id: projectId });
    await globalVolumeTypeStore.fetchList();
    await globalKeypairStore.fetchList();
    this.setState({
      isLoading: false,
    });
  };

  getFilteredValue = (value) => value.filter((it) => !it.hidden);

  renderQuotaCardList = (quotaCardList) => {
    const { isLoading } = this.state;
    return (
      <Row className={styles.content}>
        {Object.keys(quotaCardList).map((item, index) => (
          <Col
            className={styles.card}
            span={index === 3 ? 24 : 12}
            key={quotaCardList[item].text}
          >
            <Card
              title={quotaCardList[item].text}
              bordered={false}
              loading={isLoading}
            >
              {this.renderQuotaCardContent(index, quotaCardList, item)}
            </Card>
          </Col>
        ))}
      </Row>
    );
  };

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
          <div className={styles.progress_title}>{title}</div>
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

  renderQuotaCardContent(index, quotaCardList, item) {
    const { isLoading } = this.state;
    if (isLoading) {
      return <Spin />;
    }
    return index === 3
      ? this.renderVolumeTypes(
          globalProjectStore.quota,
          quotaCardList[item].value
        )
      : this.renderQuotaCart(
          globalProjectStore.quota,
          this.getFilteredValue(quotaCardList[item].value)
        );
  }

  renderQuotaCart = (data, item = []) =>
    item.map((i) => <div key={i.text}>{this.getItemInfo(data, i)}</div>);

  renderVolumeTypes = (data, listData) => (
    <List
      itemLayout="vertical"
      size="large"
      pagination={{
        hideOnSinglePage: true,
        pageSize: 5,
        size: 'small',
      }}
      dataSource={listData}
      renderItem={(item) => (
        <Row key={item.index} gutter={[16]}>
          {item.value.map((i) => (
            <Col span={8} key={i.text}>
              {this.getItemInfo(data, i)}
            </Col>
          ))}
        </Row>
      )}
    />
  );

  render() {
    const { isLoading } = this.state;

    const storage = [
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
    ];

    const volumeTypes = [];

    globalVolumeTypeStore.list.data.forEach((item, index) => {
      volumeTypes.push({
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
      });
    });

    const quotaCardList = {
      Compute: {
        text: t('Compute'),
        value: [
          { text: t('Instances'), key: 'instances' },
          { text: t('vCPUs'), key: 'cores' },
          { text: t('Memory'), key: 'ram' },
          { text: t('Server Group'), key: 'server_groups' },
          // { text: t('Server Group Member'), key: 'server_group_members' },
          // { text: t('keypair'), key: 'key_pairs' },
        ],
      },
      Storage: {
        text: t('Storage'),
        value: storage,
      },
      Network: {
        text: t('Network'),
        value: [
          { text: t('Router'), key: 'router' },
          { text: t('Network'), key: 'network' },
          { text: t('Subnet'), key: 'subnet' },
          { text: t('Floating IP'), key: 'floatingip' },
          { text: `${t('port')}`, key: 'port' },
          { text: t('Security Group'), key: 'security_group' },
          { text: t('Security Group Rule'), key: 'security_group_rule' },
          // TODO wait for add.
          // { text: `${t('VPN')}`, key: 'vpnservice' },
          // { text: `${t('VPN Tunnel')}`, key: 'vpnservice' },
          // { text: `${t('VPN Endpoint Group')}`, key: 'endpoint_group' },
          // { text: `${t('Load Balancer')}`, key: 'loadbalancer' },
        ],
      },
      VolumeTypes: {
        text: t('Storage Types'),
        value: volumeTypes,
      },
    };

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
        // extra={
        //   <div className={styles.action} onClick={this.handleApplyQuota}>
        //     {t('Apply for extended quota')}
        //   </div>
        // }
      >
        {this.renderQuotaCardList(quotaCardList)}
      </Card>
    );
  }
}

export default inject('rootStore')(observer(QuotaOverview));
