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
import globalRouterStore from 'stores/neutron/router';
import {
  getPortsWithFixedIPs,
  getSubnetToRouter,
} from 'resources/neutron/floatingip';
import { getOptions } from 'utils';

export const routerStatus = {
  ACTIVE: t('Active'),
  ERROR: t('Error'),
};

export const routerState = {
  UP: t('Up'),
  DOWN: t('Down'),
};

export const getRouterState = (state) => (state ? t('Up') : t('Down'));

export const getRouterColumns = (self) => [
  {
    title: t('ID/Name'),
    dataIndex: 'name',
    routeName: self.getRouteName('routerDetail'),
  },
  {
    title: t('Project ID/Name'),
    dataIndex: 'project_name',
    isHideable: true,
    hidden: !self.isAdminPage,
    sortKey: 'project_id',
  },
  {
    title: t('Status'),
    dataIndex: 'status',
    valueMap: routerStatus,
  },
  {
    title: t('Open External Gateway'),
    dataIndex: 'hasExternalGateway',
    valueRender: 'yesNo',
    isHideable: true,
    sorter: false,
  },
  {
    title: t('External Network ID/Name'),
    dataIndex: 'externalNetworkName',
    isHideable: true,
    sorter: false,
    isLink: true,
    idKey: 'externalNetworkId',
    routeName: self.getRouteName('networkDetail'),
  },
  {
    title: t('External Fixed IP'),
    dataIndex: 'externalFixedIps',
    isHideable: true,
    sorter: false,
    render: (value) =>
      value.map((it) => <div key={it.ip_address}>{it.ip_address}</div>) || '-',
    stringify: (value) => value.map((it) => it.ip_address).join(',') || '-',
  },
  {
    title: t('Created At'),
    dataIndex: 'created_at',
    valueRender: 'sinceTime',
    isHideable: true,
    sorter: false,
  },
];

export const routerFilters = [
  {
    label: t('Name'),
    name: 'name',
  },
  {
    label: t('Status'),
    name: 'status',
    options: getOptions(routerStatus),
  },
];

export const routerSortProps = {
  isSortByBack: true,
  defaultSortKey: 'status',
  defaultSortOrder: 'descend',
};

export const getRouterSelectTablePropsBackend = (self) => ({
  ...routerSortProps,
  columns: getRouterColumns(self),
  filterParams: routerFilters,
});

/**
 * get routers information only id & external_gateway_info
 * @param project_id
 * @returns {Promise<*>}
 */
export async function getRoutersWithIDAndExtInfo(project_id) {
  const params = {
    fields: ['id', 'external_gateway_info'],
    project_id,
  };
  const routers = await globalRouterStore.pureFetchList(params);
  return routers;
}

/**
 * get router ids that linked to fip
 * @param project_id
 * @param item
 * @returns {Promise<*>}
 */
export async function getLinkedRouterIdsByFip(project_id, item) {
  const routers = await getRoutersWithIDAndExtInfo(project_id);
  return routers
    .filter(
      (router) =>
        router.external_gateway_info &&
        router.external_gateway_info.network_id === item.floating_network_id
    )
    .map((router) => router.id);
}

/**
 * Get all subnet=>router mappings under the current project
 * @param project_id
 * @returns {Promise<[]>}
 */
export async function getCanReachSubnetIdsWithRouterId(
  project_id,
  routerFilterFunc
) {
  // get the router's id and external gateway
  // make a map: router_id => external_network_id
  let routerIdWithExternalNetworkInfo = await getRoutersWithIDAndExtInfo(
    project_id
  );
  if (routerFilterFunc) {
    routerIdWithExternalNetworkInfo =
      routerIdWithExternalNetworkInfo.filter(routerFilterFunc);
  }
  const portsWithFixedIPs = await getPortsWithFixedIPs();
  // Get the gateways of the subnets bound to the routers, can get the subnet IPs bound to the routers.
  const canReachSubnetIdsWithRouterId = getSubnetToRouter(
    portsWithFixedIPs,
    routerIdWithExternalNetworkInfo
  );
  return {
    canReachSubnetIdsWithRouterId,
    routerIdWithExternalNetworkInfo,
  };
}

export async function getCanReachSubnetIdsWithRouterIdInComponent(
  routerFilterFunc
) {
  const { canReachSubnetIdsWithRouterId, routerIdWithExternalNetworkInfo } =
    await getCanReachSubnetIdsWithRouterId(
      this.currentProjectId,
      routerFilterFunc
    );
  this.setState({
    canReachSubnetIdsWithRouterId,
    routerIdWithExternalNetworkInfo,
  });
  return canReachSubnetIdsWithRouterId;
}
