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
import PopoverSubnets from 'components/Popover/PopoverSubnets';
import { isEmpty } from 'lodash';
import globalProjectStore from 'stores/keystone/project';

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
    routeName: self.getRouteName('networkDetail'),
  },
  {
    title: t('Is Current Project'),
    dataIndex: 'tenant_id',
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
    valueMap: networkStatus,
  },
  {
    title: t('Subnet Count'),
    dataIndex: 'subnets',
    render: (value, record) => {
      const count = (value || []).length;
      if (count === 0) {
        return count;
      }
      return <PopoverSubnets subnetIds={record.subnets} title={count} />;
    },
    stringify: (subnets) => `${subnets.length}(${subnets.join(',')})`,
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

export const subnetIpv6Tip = t(
  'Default is slaac, for details, see https://docs.openstack.org/neutron/latest/admin/config-ipv6.html'
);

export const subnetColumns = [
  {
    title: t('Name'),
    dataIndex: 'name',
  },
  {
    title: t('CIDR'),
    dataIndex: 'cidr',
  },
  {
    title: t('Gateway IP'),
    dataIndex: 'gateway_ip',
  },
  {
    title: t('IP Version'),
    dataIndex: 'ip_version',
  },
  {
    title: t('Created At'),
    dataIndex: 'created_at',
    valueRender: 'toLocalTime',
  },
];

// deal with quota
export async function fetchNeutronQuota(self) {
  self.setState({
    quota: {},
    quotaLoading: true,
  });
  const result = await globalProjectStore.fetchProjectNeutronQuota();
  self.setState({
    quota: result,
    quotaLoading: false,
  });
}

export const getQuota = (neutronQuota, quotaKeys = ['network']) => {
  if (isEmpty(neutronQuota)) {
    return {};
  }
  return quotaKeys.reduce((pre, cur) => {
    pre[cur] = neutronQuota[cur] || {};
    return pre;
  }, {});
};

export const getAdd = (neutronQuota, quotaKeys = ['network'], wishes = [1]) => {
  if (isEmpty(neutronQuota)) {
    return [];
  }
  const info = getQuota(neutronQuota, quotaKeys);
  let hasError = false;
  quotaKeys.forEach((key, index) => {
    if (!hasError) {
      const quotaDetail = info[key];
      const { left = 0 } = quotaDetail || {};
      const wish = wishes[index];
      if (left !== -1 && left < wish) {
        hasError = true;
      }
    }
  });
  if (!hasError) {
    return wishes;
  }
  return new Array(quotaKeys.length).fill(0);
};

const titleMap = {
  network: t('Network'),
  subnet: t('Subnet'),
  port: t('Port'),
  router: t('Router'),
  security_group: t('Security Group'),
  security_group_rule: t('Security Group Rule'),
  floatingip: t('Floating IP'),
  firewall_group: t('Firewall'),
  firewall_policy: t('Firewall Policy'),
  firewall_rule: t('Firewall Rule'),
};

export const getQuotaInfo = (self, quotaKeys = ['network'], wishes = [1]) => {
  const { quota = {}, quotaLoading } = self.state;
  if (quotaLoading || isEmpty(quota)) {
    return [];
  }
  const adds = getAdd(quota, quotaKeys, wishes);
  const infos = getQuota(quota, quotaKeys);
  return quotaKeys.map((key, index) => {
    const type = index === 0 ? 'ring' : 'line';
    const title = titleMap[key];
    const info = infos[key] || {};
    return {
      ...info,
      add: adds[index],
      name: key,
      title,
      type,
    };
  });
};

export const checkQuotaDisable = (quotaKeys, wishes) => {
  const { neutronQuota = {} } = globalProjectStore;
  const adds = getAdd(neutronQuota, quotaKeys, wishes);
  return adds[0] === 0;
};
