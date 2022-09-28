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

export const getQosPolicyColumns = ({ self, all = false }) => {
  const ret = [
    {
      title: t('ID/Name'),
      dataIndex: 'name',
      routeName: self.getRouteName('networkQosDetail'),
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
      render: (rules) =>
        rules.length ? (
          <Row>
            {rules.map((rule) => (
              <Col span={24} key={rule.direction}>
                {getRuleValue(rule)}
              </Col>
            ))}
          </Row>
        ) : (
          '-'
        ),
      sorter: false,
      stringify: (rules) =>
        rules.length ? rules.map((rule) => getRuleValue(rule)).join('\n') : '-',
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
  if (all && self.isAdminPage) {
    ret.splice(2, 0, {
      title: t('Project ID/Name'),
      dataIndex: 'project_name',
      sortKey: 'project_id',
    });
  }
  return ret;
};

export const getQosPolicyFilters = ({ self, shared = false }) => {
  const ret = [
    {
      label: t('Name'),
      name: 'name',
    },
    {
      label: t('Description'),
      name: 'description',
    },
  ];
  if (!shared) {
    ret.push({
      label: t('Shared'),
      name: 'shared',
      options: yesNoOptions,
    });
  }
  if (self.hasAdminRole) {
    ret.push({
      label: t('Project ID'),
      name: 'tenant_id',
    });
  }
  return ret;
};

export const qosPolicySortProps = {
  isSortByBack: true,
  defaultSortKey: 'name',
  defaultSortOrder: 'descend',
};

export const getQosPolicySelectTableProps = ({ self, all, shared }) => ({
  ...qosPolicySortProps,
  columns: getQosPolicyColumns({ self, all }),
  filterParams: getQosPolicyFilters({ self, shared }),
});

/**
 *  getQosPolicyTabs in component, should used by call/apply to make ‘this' point to component
 */
export function getQoSPolicyTabs(extraProps = {}) {
  const baseProps = {
    backendPageStore: this.qosPolicyStore,
    ...extraProps,
  };
  const ret = [
    {
      title: t('Current Project QoS Policies'),
      key: 'project',
      props: merge({}, baseProps, {
        ...getQosPolicySelectTableProps({ self: this }),
        extraParams: {
          project_id: this.currentProjectId,
        },
      }),
    },
    {
      title: t('Shared QoS Policies'),
      key: 'shared',
      props: merge({}, baseProps, {
        ...getQosPolicySelectTableProps({ shared: true, self: this }),
        extraParams: {
          shared: true,
        },
      }),
    },
  ];

  if (this.hasAdminRole) {
    ret.push({
      title: t('All QoS Policies'),
      key: 'all',
      props: merge({}, baseProps, {
        ...getQosPolicySelectTableProps({ all: true, self: this }),
        extraParams: {
          all_projects: true,
        },
      }),
    });
  }

  return ret;
}
