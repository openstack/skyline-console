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
import { Col, Row } from 'antd';
import { merge } from 'lodash';
import { yesNoOptions } from 'utils/constants';

const getRuleValue = (rule) => {
  if (rule.direction === 'egress') {
    return `${t('Egress')}: ${t('Max BandWidth')}: ${
      rule.max_kbps / 1024
    } Mbps; ${t('Max Burst')}: ${rule.max_burst_kbps / 1024} Mbps`;
  }
  return rule.direction === 'ingress'
    ? `${t('Ingress')}: ${t('Max BandWidth')}: ${
        rule.max_kbps / 1024
      } Mbps; ${t('Max Burst')}: ${rule.max_burst_kbps / 1024} Mbps`
    : `${t('DSCP Marking')}: ${rule.dscp_mark}`;
};

export const qosPolicyColumns = [
  {
    title: t('ID/Name'),
    dataIndex: 'name',
  },
  {
    title: t('Description'),
    dataIndex: 'description',
    sorter: false,
  },
  {
    title: t('Rules Number'),
    dataIndex: 'rulesNumber',
    render: (value, record) => record.rules.length,
    isHideable: true,
    sorter: false,
  },
  {
    title: t('Rules'),
    dataIndex: 'rules',
    render: (rules) => (
      <Row>
        {rules.map((rule) => (
          <Col span={24} key={rule.direction}>
            {getRuleValue(rule)}
          </Col>
        ))}
      </Row>
    ),
    stringify: (rules) => rules.map((rule) => getRuleValue(rule)).join('\n'),
  },
  {
    title: t('Shared'),
    dataIndex: 'shared',
    valueRender: 'yesNo',
    width: 80,
    sorter: false,
  },
  {
    title: t('Default Policy'),
    dataIndex: 'is_default',
    valueRender: 'yesNo',
    isHideable: true,
    width: 100,
    sorter: false,
  },
  {
    title: t('Created At'),
    dataIndex: 'created_at',
    valueRender: 'toLocalTime',
    isHideable: true,
    sorter: false,
  },
];

export const qosPolicyFilters = [
  {
    label: t('Name'),
    name: 'name',
  },
  {
    label: t('Description'),
    name: 'description',
  },
  {
    label: t('Shared'),
    name: 'shared',
    options: yesNoOptions,
  },
];

export const qosPolicySortProps = {
  isSortByBack: true,
  defaultSortKey: 'name',
  defaultSortOrder: 'descend',
};

export const qosPolicySelectTableProps = {
  ...qosPolicySortProps,
  columns: qosPolicyColumns,
  filterParams: qosPolicyFilters,
};

/**
 *  * getQosPolicyTabs in component, should used by call/apply to make ‘this' point to component
 * @param {*} extraProps
 * @returns {[{title: *, key: string, props: *}, {title: *, key: string, props: *}]}
 */
export function getQoSPolicyTabs(extraProps) {
  const baseProps = {
    ...qosPolicySelectTableProps,
    backendPageStore: this.qosPolicyStore,
    ...extraProps,
  };
  // make ID/Name column show id
  baseProps.columns[0].linkPrefix = `/network/${this.getUrl(
    'qos-policy'
  )}/detail`;
  const ret = [
    {
      title: t('Current Project QoS Policy'),
      key: 'project',
      props: merge({}, baseProps, {
        extraParams: {
          project_id: this.currentProjectId,
        },
      }),
    },
    {
      title: t('Shared QoS Policy'),
      key: 'shared',
      props: merge({}, baseProps, {
        extraParams: {
          shared: true,
        },
      }),
    },
  ];

  // shared tab do not need shared filter
  const sharedFilterIndex = ret[1].props.filterParams.findIndex(
    (i) => i.name === 'shared'
  );
  ret[1].props.filterParams.splice(sharedFilterIndex, 1);

  if (this.hasAdminRole) {
    const adminBaseProps = merge({}, baseProps, {
      extraParams: {
        all_projects: true,
      },
    });
    adminBaseProps.columns.splice(1, 0, {
      title: t('Project ID/Name'),
      dataIndex: 'project_name',
      sortKey: 'project_id',
    });
    ret.push({
      title: t('All QoS Policy'),
      key: 'all',
      props: adminBaseProps,
    });
  }
  return ret;
}
