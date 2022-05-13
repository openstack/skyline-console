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
import { getOptions } from 'utils/index';
import { FolderOutlined, FolderAddOutlined } from '@ant-design/icons';

export const backupStatus = {
  available: t('Available'),
  error: t('Error'),
  updating: t('Updating'),
  deleting: t('Deleting'),
  applying: t('Applying'),
  error_deleting: t('Error Deleting'),
  restoring: t('Restoring'),
  creating: t('Creating'),
};

export const createTip = (
  <span>
    <span style={{ fontWeight: 600 }}>
      {t(
        'When you do online backup of the volume that has been bound, you need to pay attention to the following points:'
      )}
    </span>
    <p>
      {t(
        '1. The backup can only capture the data that has been written to the volume at the beginning of the backup task, excluding the data in the cache at that time.'
      )}
    </p>
    <p>
      {t(
        '2. To ensure the integrity of the data, it is recommended that you suspend the write operation of all files when creating a backup.'
      )}
    </p>
  </span>
);

export const backupModeList = [
  { value: false, label: t('Full Backup') },
  { value: true, label: t('Increment Backup') },
];

export const modeTip = t(
  'Create a full backup, the system will automatically create a new backup chain, the full backup name is the backup chain name; Create an incremental backup, the system will automatically create an incremental backup under the newly created backup chain.'
);

export const backupColumns = [];

export const backupPointColumns = [
  {
    title: t('Name'),
    dataIndex: 'name',
    ellipsis: true,
  },
  {
    title: t('Size'),
    dataIndex: 'size',
    isHideable: true,
    render: (value) => `${value} GB`,
  },
  {
    title: t('Status'),
    dataIndex: 'status',
    render: (value) => backupStatus[value] || value,
  },
  {
    title: t('Backup Mode'),
    dataIndex: 'is_incremental',
    isHideable: true,
    render: (value) => {
      if (value) {
        return (
          <>
            {' '}
            <FolderAddOutlined />
            <span style={{ marginLeft: 8 }}>{t('Incremental Backup')}</span>
          </>
        );
      }
      return (
        <>
          {' '}
          <FolderOutlined />
          <span style={{ marginLeft: 8 }}>{t('Full Backup')}</span>
        </>
      );
    },
    stringify: (value) => (value ? t('Incremental Backup') : t('Full Backup')),
  },
  {
    title: t('description'),
    dataIndex: 'description',
    ellipsis: true,
    isHideable: true,
  },
  {
    title: t('Created At'),
    dataIndex: 'created_at',
    isHideable: true,
    valueRender: 'sinceTime',
  },
];

export const backupPointFilters = [
  {
    label: t('Name'),
    name: 'name',
    ellipsis: true,
  },
  {
    label: t('Status'),
    name: 'status',
    options: getOptions(backupStatus),
  },
];

export const restoreTip = (
  <span>
    <span style={{ fontWeight: 600 }}>
      {t(
        'When you restore a backup, you need to meet one of the following conditions:'
      )}
    </span>
    <p>{t('1. The volume associated with the backup is available.')}</p>
    <p>
      {t(
        '2. The volume associated with the backup has been mounted, and the instance is shut down.'
      )}
    </p>
  </span>
);
