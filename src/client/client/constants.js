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

import globalRootStore from 'stores/root';
import { toJS } from 'mobx';

export const groupNameVersionMap = {
  core: 'v1',
  system: 'v1',
};

const endpointVersionMap = {
  keystone: 'v3',
  nova: 'v2.1',
  cinder: 'v3',
  glance: 'v2',
  neutron: 'v2.0',
  ironic: 'v1',
  ironicInspector: 'v1',
  heat: 'v1',
  swift: 'v1',
  octavia: 'v2',
  courier: 'v1',
  prometheus: 'api/v1',
  prometheus_sidecar: 'api/v1',
  gocron: 'api',
  panko: 'v2',
  billing_system: 'api/core.io/v1',
  workflow: 'api/core.io/v1',
};

const endpointsDefault = {
  ironic: '/api/openstack/ironic',
  ironicInspector: '/api/openstack/ironic-inspector',
  swift: '/api/openstack/swift/swift',
  octavia: '/api/openstack/octavia',
};

export const getOpenstackEndpoint = (key) => {
  const { endpoints = {} } = globalRootStore || {};
  const version = endpointVersionMap[key];
  const endpoint = endpoints[key] || endpointsDefault[key] || '';
  return version ? `${endpoint}/${version}` : endpoint;
};

export const getOriginEndpoint = (key) => {
  const endpoints = toJS((globalRootStore && globalRootStore.endpoints) || {});
  return endpoints[key];
};

export const skylineBase = () => '/api/openstack/skyline/api/v1';
export const keystoneBase = () => getOpenstackEndpoint('keystone');
export const novaBase = () => getOpenstackEndpoint('nova');
export const cinderBase = () => getOpenstackEndpoint('cinder');
export const glanceBase = () => getOpenstackEndpoint('glance');
export const neutronBase = () => getOpenstackEndpoint('neutron');
export const ironicBase = () => getOpenstackEndpoint('ironic');
export const ironicInspectorBase = () =>
  getOpenstackEndpoint('ironicInspector');
export const placementBase = () => getOpenstackEndpoint('placement');
export const heatBase = () => getOpenstackEndpoint('heat');
export const swiftBase = () => getOpenstackEndpoint('swift');
export const octaviaBase = () => getOpenstackEndpoint('octavia');
export const alertmanagerBase = () => getOpenstackEndpoint('alertmanager');
export const prometheusBase = () => getOpenstackEndpoint('prometheus');
export const prometheusSidecarBase = () =>
  getOpenstackEndpoint('prometheus_sidecar');
export const courierBase = () => getOpenstackEndpoint('courier');
export const gocronBase = () => getOpenstackEndpoint('gocron');
export const pankoBase = () => getOpenstackEndpoint('panko');
export const s3Base = () => getOpenstackEndpoint('s3');
export const billingBase = () => getOpenstackEndpoint('billing_system');
export const workflowBase = () => getOpenstackEndpoint('workflow');

export const ironicOriginEndpoint = () => getOriginEndpoint('ironic');
export const s3OriginEndpoint = () => getOriginEndpoint('s3');
export const billingEndpoint = () => getOriginEndpoint('billing_system');
export const firewallEndpoint = () => getOriginEndpoint('neutron_firewall');
export const vpnEndpoint = () => getOriginEndpoint('neutron_vpn');
export const lbEndpoint = () => getOriginEndpoint('octavia');

export const apiVersionMaps = {
  nova: {
    key: 'Openstack-Api-Version',
    value: 'compute 2.79',
  },
  placement: {
    key: 'Openstack-Api-Version',
    value: 'placement 1.28',
  },
  cinder: {
    key: 'Openstack-Api-Version',
    value: 'volume 3.59',
  },
  ironic: {
    key: 'X-Openstack-Ironic-Api-Version',
    value: '1.58',
  },
  'ironic-inspect': {
    key: 'X-OpenStack-Ironic-Inspector-API-Version',
    value: '1.15',
  },
};

export const getOpenstackApiVersion = (url) => {
  const key = Object.keys(apiVersionMaps).find((it) => url.indexOf(it) > -1);
  if (!key) {
    return null;
  }
  return apiVersionMaps[key];
};

export const getK8sTypeEndpoint = (groupName, baseUrl) =>
  `${baseUrl}/${groupName}/${groupNameVersionMap[groupName]}`;