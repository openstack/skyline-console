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
import ImageType from 'components/ImageType';
import { formatSize } from 'utils';
import { get } from 'lodash';
import globalRootStore from 'stores/root';

export const imageStatus = {
  active: t('Active'),
  saving: t('Saving'),
  queued: t('Queued'),
  pending_delete: t('Pending Delete'),
  killed: t('Killed'),
  deactivated: t('Deactivated'),
  deleted: t('Deleted'),
  importing: t('Importing'),
};

export const imageVisibility = {
  public: t('Public'),
  private: t('Private'),
  shared: t('Shared'),
  // unknown: t('Unknown'),
};

export const imageOS = {
  centos: t('CentOS'),
  ubuntu: t('Ubuntu'),
  fedora: t('Fedora'),
  windows: t('Windows'),
  debian: t('Debian'),
  coreos: t('CoreOS'),
  arch: t('Arch'),
  freebsd: t('FreeBSD'),
  rocky: t('Rocky'),
  others: t('Others'),
};

export const imageUsage = {
  common: t('Common Server'),
  ironic: t('Bare Metal'),
  ironic_enroll: t('Bare Metal Enroll'),
  octavia: t('Load Balancer'),
  trove: t('Database'),
  magnum: t('Container'),
  heat: t('Application Template'),
};

export const imageFormatsConsole = {
  raw: t('RAW - Raw disk image format'),
  qcow2: t('QCOW2 - QEMU image format'),
  iso: t('ISO - Optical disc image format'),
};

export const volumeCreateImageTypes = {
  raw: t('RAW - Raw disk image format'),
  qcow2: t('QCOW2 - QEMU image format'),
};

export const imageContainerFormats = {
  bare: 'Bare',
  docker: 'Docker',
};

export const imageFormatsAdmin = {
  aki: t('AKI - Amazon kernel image format'),
  ari: t('ARI - Amazon ramdisk image format'),
  ami: t('AMI - Amazon server image format'),
  vdi: t('VDI - VirtualBox compatible image format'),
  vhd: t('VHD - VirtualPC compatible image format'),
  vmdk: t('VMDK - Hyper-V compatible image format'),
};
export const imageFormats = {
  ...imageFormatsConsole,
  ...imageFormatsAdmin,
};

export const imageProperties = {
  id: t('ID'),
  checksum: t('Checksum'),
  members: t('Members'),
  min_disk: t('Min. Disk'),
  min_ram: t('Min. RAM'),
  name: t('Name'),
  owner: t('Owner'),
  updated_at: t('Updated At'),
  visibility: t('Visibility'),
  description: t('Description'),
  architecture: t('Architecture'),
  kernel_id: t('Kernel ID'),
  ramdisk_id: t('Ramdisk ID'),
  created_at: t('Created At'),
  container_format: { label: t('Container Format'), filter: 'uppercase' },
  disk_format: { label: t('Disk Format'), filter: 'uppercase' },
  is_public: { label: t('Is Public'), filter: 'yesNo' },
  type: t('Type'),
  protected: { label: t('Protected'), filter: 'yesNo' },
  size: { label: t('Size'), filter: 'bytes' },
  status: t('Status'),
};

export const transitionStatusList = ['saving', 'queued', 'pending_delete'];

export const isOwnerOrAdmin = (item) => {
  if (globalRootStore.projectId === item.owner) {
    return true;
  }
  return globalRootStore.hasAdminRole;
};

export const isOwner = (item) => {
  if (globalRootStore.projectId === item.owner) {
    return true;
  }
  return false;
};

export const isSnapshot = (item) => {
  // bfv vm has bdm; non-bfv has instance_uuid, image_type is added by frontend
  const { block_device_mapping: bdm = '[]', image_type, instance_uuid } = item;
  return (
    image_type === 'snapshot' ||
    get(JSON.parse(bdm)[0] || {}, 'source_type') === 'snapshot' ||
    instance_uuid
  );
};

export const canImageCreateInstance = (item) =>
  item.status === 'active' &&
  (item.usage_type === 'common' || item.usage_type === undefined);

export const canImageCreateIronicInstance = (item) =>
  item.status === 'active' &&
  (item.usage_type === 'ironic' || item.usage_type === undefined);

export const canSnapshotCreateInstance = (item) => item.status === 'active';

export const getImageSystemTabs = () => {
  const valueList = [
    'others',
    'centos',
    'ubuntu',
    'fedora',
    'windows',
    'debian',
    'coreos',
    'arch',
    'freebsd',
    'rocky',
  ];
  return valueList.map((value) => {
    const label =
      value !== 'others'
        ? value.slice(0, 1).toUpperCase() + value.slice(1)
        : t('Others');
    return {
      label,
      value,
      component: <ImageType type={value} />,
    };
  });
};

export const getImageOS = (item) =>
  imageOS[item.os_distro] ? item.os_distro : 'others';

export const getImageColumns = (self) => [
  {
    title: t('Name'),
    dataIndex: 'name',
  },
  {
    title: t('Project'),
    dataIndex: 'project_name',
    hidden: !self.hasAdminRole,
  },
  {
    title: t('Current Project'),
    dataIndex: 'owner',
    hidden: !self.hasAdminRole,
    render: (value) => (value === self.currentProjectId ? t('Yes') : t('No')),
  },
  {
    title: t('System'),
    dataIndex: 'os_distro',
    valueMap: imageOS,
  },
  {
    title: t('OS Version'),
    dataIndex: 'os_version',
  },
  {
    title: t('Min System Disk'),
    dataIndex: 'min_disk',
    render: (text) => formatSize(text * 1024, 2),
  },
  {
    title: t('Min Memory'),
    dataIndex: 'min_ram',
    render: (text) => formatSize(text, 2),
  },
  {
    title: t('Access Control'),
    dataIndex: 'visibility',
    valueMap: imageVisibility,
  },
  {
    title: t('Format'),
    dataIndex: 'disk_format',
    valueMap: imageFormats,
  },
  {
    title: t('Image Size'),
    dataIndex: 'size',
    valueRender: 'formatSize',
  },
];
