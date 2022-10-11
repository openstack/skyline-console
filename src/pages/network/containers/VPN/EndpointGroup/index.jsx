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

import React, { useEffect, useState } from 'react';
import { observer, inject } from 'mobx-react';
import Base from 'containers/List';
import { VpnEndPointGroupStore } from 'stores/neutron/vpn-endpoint-group';
import { Col, Popover, Row, Spin } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import { SubnetStore } from 'stores/neutron/subnet';
import { idNameColumn } from 'utils/table';
import { actionConfigs, adminConfigs } from './actions';

export class EndpointGroup extends Base {
  init() {
    this.store = new VpnEndPointGroupStore();
    this.downloadStore = new VpnEndPointGroupStore();
  }

  get isFilterByBackend() {
    return true;
  }

  get fetchDataByCurrentProject() {
    // add project_id to fetch data;
    return true;
  }

  get policy() {
    return 'get_endpoint_group';
  }

  get aliasPolicy() {
    return 'neutron:get_endpoint_group';
  }

  get name() {
    return t('vpn endpoint groups');
  }

  get adminPageHasProjectFilter() {
    return true;
  }

  get hasTab() {
    return true;
  }

  get actionConfigs() {
    if (this.isAdminPage) {
      return adminConfigs;
    }
    return actionConfigs;
  }

  getColumns = () => [
    idNameColumn,
    {
      title: t('Project ID/Name'),
      dataIndex: 'project_name',
      hidden: !this.isAdminPage,
    },
    {
      title: t('Description'),
      dataIndex: 'description',
      render: (value) => value || '-',
      isHideable: true,
    },
    {
      title: t('Type'),
      dataIndex: 'type',
      isHideable: true,
      render: (type) => {
        switch (type) {
          case 'subnet':
            return t('Local');
          case 'cidr':
            return t('Peer');
          default:
            return '';
        }
      },
    },
    {
      title: t('Endpoint Counts'),
      dataIndex: 'endpoints',
      render: (endpoints, record) => {
        const content = <PopUpSubnet record={record} />;
        return (
          <>
            {endpoints.length}{' '}
            <Popover
              content={content}
              title={
                record.type === 'cidr' ? t('Peer Network') : t('Local Network')
              }
              destroyTooltipOnHide
            >
              <FileTextOutlined />
            </Popover>
          </>
        );
      },
      stringify: (endpoints) => `${endpoints.length}(${endpoints.join(',')})`,
    },
  ];

  get searchFilters() {
    return [
      {
        label: t('Name'),
        name: 'name',
      },
    ];
  }
}

function PopUpSubnet({ record }) {
  const { type, endpoints } = record;
  const [subnets, setSubnets] = useState([]);
  useEffect(() => {
    if (type === 'subnet' && subnets.length === 0) {
      (async function () {
        const promises = endpoints.map((i) =>
          new SubnetStore().fetchDetail({ id: i })
        );
        const ret = await Promise.all(promises);
        setSubnets(ret);
      })();
    }
  });
  if (type === 'cidr') {
    return (
      <Row>
        {endpoints.map((item) => (
          <Col span={24} key={`${item}_${record.id}`}>
            {item}
          </Col>
        ))}
      </Row>
    );
  }

  return subnets.length === 0 ? (
    <Spin />
  ) : (
    <Row style={{ maxWidth: 550 }}>
      {subnets.map((item) => (
        <Col span={24} key={`${item}_${record.id}`}>
          <Row gutter={24}>
            <Col span={6}>{item.name}</Col>
            <Col span={6}>{item.cidr}</Col>
            <Col span={12}>{item.id}</Col>
          </Row>
        </Col>
      ))}
    </Row>
  );
}

export default inject('rootStore')(observer(EndpointGroup));
