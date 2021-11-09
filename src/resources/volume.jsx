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
import { yesNoOptions } from 'utils/constants';
import { toLocalTimeFilter } from 'utils/index';

export const volumeStatus = {
  available: t('Available'),
  'in-use': t('In-use'),
  error: t('Error'),
  creating: t('Creating'),
  error_extending: t('Error Extending'),
  extending: t('Extending'),
  downloading: t('Downloading'),
  attaching: t('Attaching'),
  detaching: t('Detaching'),
  deleting: t('Deleting'),
  error_deleting: t('Error Deleting'),
  'backing-up': t('Backing Up'),
  'restoring-backup': t('Restoring Backup'),
  error_restoring: t('Error Restoring'),
  maintenance: t('Maintained'),
  uploading: t('Uploading'),
  'awaiting-transfer': t('Awaiting Transfer'),
  restoring: t('Restoring'),
  rollbacking: t('Restoring'),
  retyping: t('Retyping'),
  reserved: t('Reserved'),
  reverting: t('Reverting'),
};

export const creationMethod = {
  manu: t('Manu'),
  auto: t('Auto'),
};

export const diskTag = {
  os_disk: t('OS Disk'),
  data_disk: t('Data Disk'),
};

export const bootableType = {
  true: t('Yes'),
  false: t('No'),
};

export const isOsDisk = (item) => {
  if (item.disk_tag) {
    return item.disk_tag === 'os_disk';
  }
  if (
    item.bootable === 'true' &&
    item.attachments &&
    item.attachments.length !== 0 &&
    (item.attachments[0].device === '/dev/vda' ||
      item.attachments[0].device === '/dev/sda')
  ) {
    return true;
  }
  return false;
};

export const isAttachIsoVolume = (item) => {
  if (
    item.bootable === 'true' &&
    item.attachments &&
    item.attachments.length !== 0 &&
    item.attachments[0].device.indexOf('/dev/hd') !== -1
  ) {
    return true;
  }
  return false;
};

export const volumeTransitionStatuses = [
  'creating',
  'extending',
  'downloading',
  'attaching',
  'detaching',
  'deleting',
  'backing-up',
  'restoring-backup',
  'awaiting-transfer',
  'uploading',
  'rollbacking',
  'retyping',
];

export const snapshotTransitionStatuses = [
  'creating',
  'deleting',
  'updating',
  'unmanaging',
  'backing-up',
  'restoring',
  'uploading',
  'rollbacking',
];

export const canCreateInstance = (item) =>
  item.bootable === 'true' &&
  ['available', 'downloading'].indexOf(item.status) >= 0;

export const isAvailable = (item) => item.status === 'available';

export const isAvailableOrInUse = (item) =>
  item && ['available', 'in-use'].indexOf(item.status) > -1;

export const isInUse = (item) => item.status === 'in-use';

export const isMultiAttach = (item) => item.multiattach;

export const multiTip = t(
  '"Shared" volume can be mounted on multiple instances'
);

export const volumeColumns = [
  {
    title: t('ID/Name'),
    dataIndex: 'name',
    render: (value, record) => (
      <>
        <p style={{ marginBottom: 0 }}>{record.id}</p>
        <span>{value || '-'}</span>
      </>
    ),
  },
  {
    title: t('Type'),
    dataIndex: 'volume_type',
    sorter: false,
  },
  {
    title: t('Size'),
    dataIndex: 'size',
    render: (value) => `${value}GB`,
  },
  {
    title: t('Status'),
    dataIndex: 'status',
    render: (value) => volumeStatus[value] || '-',
  },
  {
    title: t('Shared'),
    dataIndex: 'multiattach',
    valueRender: 'yesNo',
    titleTip: multiTip,
    sorter: false,
  },
  {
    title: t('Attached To'),
    dataIndex: 'attachments',
    isHideable: true,
    sorter: false,
    render: (value) => {
      if (value && value.length > 0) {
        return value.map((it) => (
          <div key={it.server_id}>
            {it.device} on {it.server_name}
          </div>
        ));
      }
      return '-';
    },
  },
  {
    title: t('Created At'),
    dataIndex: 'created_at',
    valueRender: 'sinceTime',
  },
];

export const volumeFilters = [
  {
    label: t('Name'),
    name: 'name',
  },
  {
    label: t('Status'),
    name: 'status',
    options: ['available', 'in-use', 'error', 'maintenance'].map((it) => ({
      key: it,
      label: volumeStatus[it],
    })),
  },
  {
    label: t('Shared'),
    name: 'multiattach',
    options: yesNoOptions,
  },
];

export const volumeSortProps = {
  isSortByBack: true,
  defaultSortKey: 'created_at',
  defaultSortOrder: 'descend',
};

export const volumeSelectTablePropsBackend = {
  ...volumeSortProps,
  filterParams: volumeFilters,
  columns: volumeColumns,
};

export const snapshotTypeTip = (
  <>
    <p style={{ marginTop: 10 }}>
      {t(
        'The volume type needs to be consistent with the volume type when the snapshot is created.'
      )}
    </p>
    <p>
      {t(
        'If the volume associated with the snapshot has changed the volume type, please modify this option manually; if the volume associated with the snapshot keeps the volume type unchanged, please ignore this option. (no need to change).'
      )}
    </p>
  </>
);

export const getVolumnColumnsList = (self) => {
  const columns = [
    {
      title: t('ID/Name'),
      dataIndex: 'name',
      routeName: self.getRouteName('volumeDetail'),
      stringify: (name, record) => name || record.id,
      sortKey: 'name',
    },
    {
      title: t('Project ID/Name'),
      dataIndex: 'project_name',
      hidden: !self.isAdminPage,
      isHideable: true,
      sorter: false,
    },
    {
      title: t('Host'),
      dataIndex: 'host',
      isHideable: true,
      hidden: !self.isAdminPage,
      sorter: false,
    },
    {
      title: t('Size'),
      dataIndex: 'size',
      isHideable: true,
      render: (value) => `${value}GB`,
    },
    {
      title: t('Status'),
      dataIndex: 'status',
      render: (value) => volumeStatus[value] || '-',
    },
    {
      title: t('Type'),
      dataIndex: 'volume_type',
      isHideable: true,
      width: 100,
      sorter: false,
    },
    {
      title: t('Disk Tag'),
      dataIndex: 'disk_tag',
      isHideable: true,
      render: (value) => diskTag[value] || '-',
      sorter: false,
    },
    {
      title: t('Attached To'),
      dataIndex: 'attachments',
      isHideable: true,
      sorter: false,
      render: (value) => {
        if (value && value.length > 0) {
          return value.map((it) => (
            <div key={it.server_id}>
              {it.device} on{' '}
              {self.getLinkRender(
                'instanceDetail',
                it.server_name,
                { id: it.server_id },
                { tab: 'volumes' }
              )}
            </div>
          ));
        }
        return '-';
      },
      stringify: (value) => {
        if (value && value.length) {
          return value
            .map((it) => `${it.server_name}(${it.server_id})`)
            .join(',');
        }
        return '-';
      },
    },
    {
      title: t('Bootable'),
      titleTip: t(
        'When the volume is "bootable" and the status is "available", it can be used as a startup source to create an instance.'
      ),
      dataIndex: 'bootable',
      isHideable: true,
      render: (value) => bootableType[value] || '-',
    },
    {
      title: t('Shared'),
      dataIndex: 'multiattach',
      valueRender: 'yesNo',
      titleTip: multiTip,
      width: 80,
      sorter: false,
    },
    {
      title: t('Created At'),
      dataIndex: 'created_at',
      isHideable: true,
      valueRender: 'sinceTime',
      stringify: (value) => toLocalTimeFilter(value),
    },
  ];
  if (self.inDetailPage) {
    return columns.filter((it) => it.dataIndex !== 'attachments');
  }
  return columns;
};
