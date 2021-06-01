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
import { shuffle } from 'lodash';
import { toJS } from 'mobx';
import i18n from 'core/i18n';

const { t } = i18n;

export const MODULE_KIND_MAP = {
  deployments: 'Deployment',
  statefulsets: 'StatefulSet',
  daemonsets: 'DaemonSet',
  jobs: 'Job',
  cronjobs: 'CronJob',
  pods: 'Pod',
  services: 'Service',
  ingresses: 'Ingress',
  volumes: 'PersistentVolumeClaim',
  storageclasses: 'StorageClass',
  'alerting-policy': 'AlertingPolicy',
  configmaps: 'ConfigMap',
  secrets: 'Secret',
  s2ibuilders: 'S2iBuilder',
  nodes: 'Node',
  ingress: 'Ingress',
  certificates: 'Ingress',
};

export const LANG_MAP = {
  zh: 'zh-cn',
  en: 'en',
};

export const TIME_MICROSECOND_MAP = {
  '1h': 3600000,
  '2h': 7200000,
  '3h': 10800000,
  '6h': 21600000,
  '12h': 43200000,
  '24h': 86400000,
  '2d': 172800000,
};

export const COLORS_MAP = {
  white: '#fff',
  light: '#f9fbfd',
  lightest: '#f9fbfd',
  dark: '#242e42',
  grey: '#e3e9ef',
  green: '#1890ff',
  blue: '#329dce',
  red: '#ca2621',
  yellow: '#f5a623',
  darkerGreen: '#479e88',
  darkerBlue: '#3385b0',
  darkerRed: '#ab2f29',
  darkerYellow: '#e0992c',
  darkestGreen: '#3b747a',
  darkestBlue: '#326e93',
  darkestRed: '#8c3231',
  darkestYellow: '#8d663e',
  lighterGreen: '#a2d8bb',
  lighterBlue: '#7eb8dc',
  lighterRed: '#ea8573',
  lighterYellow: '#ffc781',
  lightestGreen: '#c4e6d4',
  lightestBlue: '#c7deef',
  lightestRed: '#fae7e5',
  lightestYellow: '#ffe1be',
};

export const MILLISECOND_IN_TIME_UNIT = {
  s: 1000,
  m: 60000,
  h: 3600000,
  d: 86400000,
  w: 604800000,
};

export const SECOND_IN_TIME_UNIT = {
  s: 1,
  m: 60,
  h: 3600,
  d: 86400,
  w: 604800,
  month: 2592000,
  year: 31536000,
};

export const MAX_SIZE_UPLOAD = 2 * 1024 * 1024;

export const LIST_DEFAULT_ORDER = {
  deployments: 'updateTime',
  jobs: 'updateTime',
};

const kb = 1024;
const mb = kb * 1024;
const gb = mb * 1024;
const tb = gb * 1024;

export const SIZE_VALUE = {
  kb,
  mb,
  gb,
  tb,
};

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
};

const endpointsDefault = {
  ironic: '/api/openstack/ironic',
  ironicInspector: '/api/openstack/ironic-inspector',
  swift: '/api/openstack/swift/swift',
  octavia: '/api/openstack/octavia',
};

export const getOpenstackEndpoint = (key) => {
  // const endpoints = getLocalStorageItem('endpoints') || {};
  const endpoints = globalRootStore.endpoints || {};
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

export const ironicOriginEndpoint = () => getOriginEndpoint('ironic');
export const s3OriginEndpoint = () => getOriginEndpoint('s3');
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

export const emptyActionConfig = {
  rowActions: {},
  batchActions: [],
  primaryActions: [],
};

export const yesNoOptions = [
  { label: t('Yes'), key: true, value: true },
  { label: t('No'), key: false, value: false },
];

export const projectTagsColors = shuffle([
  'red',
  'volcano',
  'orange',
  'gold',
  'lime',
  'green',
  'cyan',
  'blue',
  'geekblue',
  'purple',
]);

export const statusTypes = [
  {
    label: t('Enable'),
    value: true,
  },
  {
    label: t('Forbidden'),
    value: false,
  },
];
