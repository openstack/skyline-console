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
import { Col, Empty, Popover, Row, Spin } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import { SubnetStore } from 'stores/neutron/subnet';

export const networkStatus = {
  ACTIVE: t('Active'),
  BUILD: t('Build'),
  DOWN: t('Down'),
  ERROR: t('Error'),
};

export const networkState = {
  UP: t('Up'),
  DOWN: t('Down'),
};

export const networkColumns = (self) => [
  {
    title: t('ID/Name'),
    dataIndex: 'name',
    linkPrefix: `/network/${self.getUrl('networks')}/detail`,
  },
  {
    title: t('Is Current Project'),
    dataIndex: 'project_id',
    render: (value) => (value === self.currentProjectId ? t('Yes') : t('No')),
    hidden: self.isAdminPage,
    sorter: false,
  },
  {
    title: t('External'),
    dataIndex: 'router:external',
    valueRender: 'yesNo',
    sorter: false,
  },
  {
    title: t('Shared'),
    dataIndex: 'shared',
    valueRender: 'yesNo',
    sorter: false,
  },
  {
    title: t('Status'),
    dataIndex: 'status',
    render: (value) => networkStatus[value] || '-',
  },
  {
    title: t('Subnet Count'),
    dataIndex: 'subnets',
    render: (value, record) => {
      const content = <PopUpSubnet subnetIds={record.subnets} />;
      return (
        <>
          {(value && value.length) || 0}{' '}
          {value && value.length !== 0 && (
            <Popover content={content} destroyTooltipOnHide>
              <FileTextOutlined />
            </Popover>
          )}
        </>
      );
    },
    sorter: false,
  },
  {
    title: t('Created At'),
    dataIndex: 'created_at',
    valueRender: 'sinceTime',
    isHideable: true,
    sorter: false,
  },
];

export const networkSortProps = {
  isSortByBack: true,
  defaultSortKey: 'status',
  defaultSortOrder: 'descend',
};

export const ipTypeOptions = [
  {
    label: t('Automatically Assigned Address'),
    value: 0,
  },
  {
    label: t('Manually Assigned Address'),
    value: 1,
  },
];

export const getAnchorData = (num, y) => {
  const xLength = parseFloat(1 / (num + 1)).toFixed(2);
  const result = [];
  for (let i = 1; i < num + 1; i++) {
    const x = i * xLength;
    result.push([x, y]);
  }
  return result;
};

export const isExternalNetwork = (network) => !!network['router:external'];

function PopUpSubnet({ subnetIds }) {
  const [subnets, setSubnets] = useState(subnetIds);
  const [isLoading, setLoaidng] = useState(false);
  useEffect(() => {
    setLoaidng(true);
    (async function () {
      const promises = subnets.map((i) =>
        new SubnetStore().fetchDetail({ id: i })
      );
      const ret = await Promise.all(promises);
      setSubnets(ret);
      setLoaidng(false);
    })();
  }, []);
  if (isLoading) {
    return <Spin />;
  }
  return subnets.length === 0 ? (
    <Empty />
  ) : (
    subnets.map((item, index) => (
      <Row gutter={[24]} key={`${item}_${index}`} style={{ minWidth: 300 }}>
        <Col span={12}>{item.name}</Col>
        <Col span={12}>{item.cidr}</Col>
      </Row>
    ))
  );
}
