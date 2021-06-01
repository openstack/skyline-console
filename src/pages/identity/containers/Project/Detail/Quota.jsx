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
import { observer, inject } from 'mobx-react';

import globalProjectStore from 'stores/keystone/project';
import { Card, Col, Row, List } from 'antd';
import Progress from 'components/ProjectProgress';
import classnames from 'classnames';
import globalVolumeTypeStore from 'stores/cinder/volume-type';
import styles from './index.less';

// const { Panel } = Collapse;

@inject('rootStore')
@observer
export default class Quota extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.init();
  }

  componentDidMount() {
    this.getData();
  }

  getData = async () => {
    const { id: project_id } = this.props.match.params;
    await this.store.fetchProjectQuota({
      project_id,
    });
    await globalVolumeTypeStore.fetchList();
  };

  getItemInfo = (i) => {
    const { quota } = this.store;
    const resource = quota[i.key];
    return <Progress resource={resource} name={i.text} nameSpan={8} />;
  };

  init() {
    this.store = globalProjectStore;
  }

  renderVolumeTypes = (listData) => (
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
              {this.getItemInfo(i)}
            </Col>
          ))}
        </Row>
      )}
    />
  );

  render() {
    const { quota } = this.store;
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

    return (
      <div className={classnames(styles.wrapper, this.className)}>
        <Card>
          {quota.instances ? (
            <div>
              <Row>
                <Col xs={{ span: 8, offset: 1 }} lg={{ span: 8 }}>
                  <div style={{ fontSize: 16, marginBottom: 12 }}>
                    {t('Compute')}
                  </div>
                  <Progress resource={quota.instances} name={t('instance')} />
                  <Progress resource={quota.cores} name={t('core')} />
                  <Progress resource={quota.ram} name={t('ram')} />
                  {/* <Progress resource={quota.key_pairs} name={t('keypair')} /> */}
                  <div>
                    <p style={{ float: 'right' }}>
                      （ {t('Member in group')} :{' '}
                      {quota.server_group_members &&
                      quota.server_group_members.limit === -1
                        ? t('Unlimit')
                        : quota.server_group_members.limit}{' '}
                      ）
                    </p>
                    <Progress
                      resource={quota.server_groups}
                      name={t('Server Group')}
                    />
                  </div>
                  {/* <Progress resource={quota.server_group_members} name={t('Server Group Member')} /> */}
                </Col>
              </Row>
            </div>
          ) : null}
          {quota.volumes ? (
            <div>
              <Row style={{ marginTop: 30 }}>
                <Col xs={{ span: 8, offset: 1 }} lg={{ span: 8 }}>
                  <div style={{ fontSize: 16, marginBottom: 12 }}>
                    {t('Storage')}
                  </div>
                  <Progress name={t('Volume')} resource={quota.volumes} />
                  <Progress
                    name={`${t('gigabytes')}(GB)`}
                    resource={quota.gigabytes}
                  />
                  <Progress name={t('backups')} resource={quota.backups} />
                  <Progress
                    name={t('Backup Capacity')}
                    resource={quota.backup_gigabytes}
                  />
                  <Progress name={t('Snapshot')} resource={quota.snapshots} />
                </Col>
                <Col xs={{ span: 8, offset: 1 }} lg={{ span: 8, offset: 6 }}>
                  <div style={{ fontSize: 16, marginBottom: 12 }}>
                    {t('Network')}
                  </div>
                  <Progress resource={quota.router} name={t('router')} />
                  <Progress resource={quota.network} name={t('network')} />
                  <Progress resource={quota.subnet} name={t('subnet')} />
                  <Progress
                    resource={quota.floatingip}
                    name={t('floatingip')}
                  />
                  <Progress resource={quota.port} name={t('port')} />
                  <Progress
                    name={t('security_group')}
                    resource={quota.security_group}
                  />
                  <Progress
                    name={t('Security Group Rule')}
                    resource={quota.security_group_rule}
                  />
                </Col>
              </Row>
            </div>
          ) : null}
          {volumeTypes[0] ? (
            <div>
              <Row style={{ marginTop: 30 }}>
                <Col xs={{ span: 22, offset: 1 }} lg={{ span: 22 }}>
                  <div style={{ fontSize: 16, marginBottom: 12 }}>
                    {t('Storage Types')}
                  </div>
                  {this.renderVolumeTypes(volumeTypes)}
                </Col>
              </Row>
            </div>
          ) : null}
        </Card>
      </div>
    );
  }
}
