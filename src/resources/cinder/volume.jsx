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
import { isEmpty } from 'lodash';
import { Link } from 'react-router-dom';
import { Tooltip } from 'antd';
import { CubeCopyButton } from 'components/cube/CubeCopyButton/CubeCopyButton';
import ImportStatus from 'components/ImportStatus';
import globalProjectStore from 'stores/keystone/project';
import globalVolumeStore from 'stores/cinder/volume';
import { yesNoOptions } from 'utils/constants';
import { renderFilterMap } from 'utils/index';
import { idNameColumn } from 'utils/table';
import { computeSizeMiB, getProgressBarColorByStatus } from 'utils/image';
import styles from './volume-table.less';

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

export const updateVolume = (volume) => {
  return {
    ...volume,
    disk_tag: isOsDisk(volume) ? 'os_disk' : 'data_disk',
    description: volume.description || (volume.origin_data || {}).description,
    delete_interval:
      volume.metadata && volume.metadata.delete_interval
        ? new Date(renderFilterMap.toLocalTime(volume.updated_at)).getTime() +
          Number(volume.metadata.delete_interval) * 1000
        : null,
  };
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

const volumeStatuses = [
  'uploading',
  'importing',
  'available',
  'creating',
  'attaching',
  'detaching',
  'deleting',
  'reserved',
  'maintenance',
  'backing-up',
  'restoring-backup',
  'in-use',
];

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
  idNameColumn,
  {
    title: t('Type'),
    dataIndex: 'volume_type',
    sorter: false,
  },
  {
    title: t('Size'),
    dataIndex: 'size',
    unit: 'GiB',
  },
  {
    title: t('Status'),
    dataIndex: 'status',
    valueMap: volumeStatus,
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

export const getVolumeColumnsList = (self) => {
  return [
    {
      title: t('ID/Name'),
      dataIndex: 'name',
      routeName: self.getRouteName('volumeDetail'),
      sortKey: 'name',
      render: (name, row) => {
        const nameValue = name || '-';
        const idValue = row.id;

        const renderId = () => {
          if (!idValue) return null;
          return (
            <div className={styles['volume-id-row']}>
              <Tooltip title={idValue}>
                <Link
                  className={styles['volume-id-link']}
                  to={
                    self.isAdminPage
                      ? `/storage/volume-admin/detail/${idValue}`
                      : `/storage/volume/detail/${idValue}`
                  }
                >
                  {idValue}
                </Link>
              </Tooltip>
              <CubeCopyButton>{idValue}</CubeCopyButton>
            </div>
          );
        };

        return (
          <div className={styles['title-col']}>
            <span className={styles['volume-name']}>{nameValue}</span>
            {renderId()}
          </div>
        );
      },
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
      unit: 'GiB',
    },
    {
      title: t('Status'),
      dataIndex: 'status',
      valueMap: volumeStatus,
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
      valueMap: diskTag,
      sorter: false,
    },
    {
      title: t('Attached To'),
      dataIndex: 'attachments',
      isHideable: true,
      sorter: false,
      render: (value) => {
        if (!value?.length) return '-';

        return value.map((it) => {
          const linkInstance = self.getLinkRender?.(
            'instanceDetail',
            it.server_name || it.server_id,
            { id: it.server_id },
            { tab: 'volumes' }
          );

          return (
            <div key={it.server_id}>
              {it.device}{' '}
              {!self.isInstanceDetail && linkInstance && (
                <span>on {linkInstance}</span>
              )}
            </div>
          );
        });
      },
      stringify: (value) => {
        if (value && value.length) {
          return value
            .map((it) => {
              const { device, server_name, server_id } = it;
              return `${device} on ${server_name || '-'}(${server_id})`;
            })
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
      valueMap: bootableType,
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
    },
  ];
};

export const getCosVolumeColumnsList = (self) => {
  return [
    {
      title: t('ID/Name'),
      dataIndex: 'volumeName',
      routeName: self.getRouteName('volumeDetail'),
      sortKey: 'name',
      render: (name, row) => {
        const nameValue = name || '-';
        const idValue = row.volumeId || row.id;

        const renderId = () => {
          if (!idValue) return null;
          return (
            <div className={styles['volume-id-row']}>
              <Tooltip title={idValue}>
                <Link
                  className={styles['volume-id-link']}
                  to={
                    self.isAdminPage
                      ? `/storage/volume-admin/detail/${idValue}`
                      : `/storage/volume/detail/${idValue}`
                  }
                >
                  {idValue}
                </Link>
              </Tooltip>
              <CubeCopyButton>{idValue}</CubeCopyButton>
            </div>
          );
        };

        return (
          <div className={styles['title-col']}>
            <span className={styles['volume-name']}>{nameValue}</span>
            {renderId()}
          </div>
        );
      },
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
      dataIndex: 'volumeSize',
      sorter: false,
      render: (value) => computeSizeMiB(value),
    },
    {
      title: t('Status'),
      dataIndex: 'volumeStatus',
      isStatus: false,
      sorter: false,
      render: ({ current, isProcessing, processPercent }) => {
        if (!volumeStatuses.includes(current)) return <span>-</span>;

        const color = getProgressBarColorByStatus(
          current,
          'uploading',
          'importing'
        );

        return (
          <ImportStatus
            color={color}
            current={current}
            isProcessing={isProcessing}
            processPercent={processPercent}
          />
        );
      },
    },
    {
      title: t('Type'),
      dataIndex: 'volumeType',
      isHideable: true,
      width: 100,
      sorter: false,
    },
    {
      title: t('Disk Tag'),
      dataIndex: 'volumeDiskTag',
      isHideable: true,
      valueMap: diskTag,
      sorter: false,
    },
    {
      title: t('Attached To'),
      dataIndex: 'attachments',
      isHideable: true,
      sorter: false,
      hidden: self.isInstanceDetail,
      render: (value) => {
        if (value && value.length > 0) {
          return value.map((it) => (
            <div key={it.server_id}>
              {it.device} on{' '}
              {self.getLinkRender(
                'instanceDetail',
                it.server_name || it.server_id,
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
            .map((it) => {
              const { device, server_name, server_id } = it;
              return `${device} on ${server_name || '-'}(${server_id})`;
            })
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
      dataIndex: 'volumeBootable',
      isHideable: true,
      valueMap: bootableType,
      sorter: false,
    },
    {
      title: t('Shared'),
      dataIndex: 'volumeShared',
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
    },
  ];
};

// deal with quota
export function setCreateVolumeSize(value) {
  globalVolumeStore.setCreateVolumeSize(value);
}

export function setCreateVolumeType(value) {
  globalVolumeStore.setCreateVolumeType(value);
}

export function setCreateVolumeCount(value) {
  globalVolumeStore.setCreateVolumeCount(value);
}

export async function fetchQuota(self, size, type = '') {
  setCreateVolumeCount(1);
  setCreateVolumeSize(size);
  setCreateVolumeType(type);
  self.setState({
    quota: {},
    quotaLoading: true,
  });
  const result = await globalProjectStore.fetchProjectCinderQuota();
  self.setState({
    quota: result,
    quotaLoading: false,
  });
}

export const getQuota = (cinderQuota) => {
  if (isEmpty(cinderQuota)) {
    return {};
  }
  const { volumeTypeForCreate } = globalVolumeStore;
  const { volumes = {}, gigabytes = {} } = cinderQuota || {};
  const typeQuotaKey = `volumes_${volumeTypeForCreate}`;
  const sizeQuotaKey = `gigabytes_${volumeTypeForCreate}`;
  const typeQuota = (cinderQuota || {})[typeQuotaKey] || {};
  const typeSizeQuota = (cinderQuota || {})[sizeQuotaKey] || {};
  return {
    volumes,
    gigabytes,
    typeQuota,
    typeSizeQuota,
  };
};

const getErrorMessage = ({ name, left, input }) => {
  if (left === 0) {
    return t('Quota: Insufficient { name } quota to create resources.', {
      name,
    });
  }
  const error = t(
    'Quota: Insufficient { name } quota to create resources, please adjust resource quantity or quota(left { left }, input { input }).',
    {
      name,
      left,
      input,
    }
  );
  return error;
};

export const getAdd = (cinderQuota, withCountCheck = true) => {
  if (isEmpty(cinderQuota)) {
    return {};
  }
  const { volumes, gigabytes, typeQuota, typeSizeQuota } =
    getQuota(cinderQuota);
  const { left = 0 } = volumes || {};
  const { left: sizeLeft = 0, limit: sizeLimit } = gigabytes || {};
  const { left: typeLeft = 0 } = typeQuota || {};
  const { left: typeSizeLeft = 0, limit: typeSizeLimit } = typeSizeQuota || {};
  const {
    volumeSizeForCreate: size = 0,
    volumeCountForCreate: count = 1,
    volumeTypeForCreate: type = '',
  } = globalVolumeStore;
  const zero = {
    add: 0,
    addSize: 0,
  };
  const totalSize = size * count;
  const create = {
    add: count,
    addSize: totalSize,
  };
  if (withCountCheck && left >= 0 && left < count) {
    const error = getErrorMessage({
      name: t('volume'),
      left,
      input: count,
    });
    return { ...zero, error };
  }
  if ((sizeLimit !== -1 && sizeLeft < totalSize) || sizeLeft === 0) {
    const error = getErrorMessage({
      name: t('volume capacity'),
      left: sizeLeft,
      input: totalSize,
    });
    return { ...zero, error };
  }
  if (isEmpty(typeQuota)) {
    return create;
  }
  if (withCountCheck && typeLeft >= 0 && typeLeft < count) {
    const error = getErrorMessage({
      name: t('{name} type', { name: type }),
      left: typeLeft,
      input: count,
    });
    return { ...zero, error };
  }
  if (
    (typeSizeLimit !== -1 && typeSizeLeft < totalSize) ||
    typeSizeLeft === 0
  ) {
    const error = getErrorMessage({
      name: t('{name} type capacity', { name: type }),
      left: typeSizeLeft,
      input: totalSize,
    });
    return { ...zero, error };
  }
  return create;
};

export const getQuotaInfo = (self, withCountCheck = true) => {
  const { volumeTypeForCreate: name } = globalVolumeStore;
  const { quota = {}, quotaLoading } = self.state;
  if (quotaLoading || isEmpty(quota)) {
    return [];
  }
  const {
    volumes = {},
    gigabytes = {},
    typeQuota = {},
    typeSizeQuota = {},
  } = getQuota(quota);
  const { add, addSize } = getAdd(quota, withCountCheck);
  const volumeData = {
    ...volumes,
    add,
    name: 'volume',
    title: t('Volume'),
  };
  const sizeData = {
    ...gigabytes,
    add: addSize,
    name: 'gigabytes',
    title: t('Volume Capacity (GiB)'),
    type: 'line',
  };
  if (!name) {
    return [volumeData, sizeData];
  }
  const typeData = {
    ...typeQuota,
    add,
    name: 'type',
    title: t('{name} type', { name }),
    type: 'line',
  };
  const typeSizeData = {
    ...typeSizeQuota,
    add: addSize,
    name: 'typeSize',
    title: t('{name} type capacity', { name }),
    type: 'line',
  };
  return [volumeData, sizeData, typeData, typeSizeData];
};

export const checkQuotaDisable = (withCountCheck = true) => {
  const { cinderQuota = {} } = globalProjectStore;
  const { add, addSize } = getAdd(cinderQuota, withCountCheck);
  return withCountCheck ? add === 0 : addSize === 0;
};

export const onVolumeSizeChange = (value) => {
  setCreateVolumeSize(value);
};

export const onVolumeTypeChange = (value) => {
  const { volumeTypes = [] } = globalVolumeStore;
  const item = volumeTypes.find((it) => it.value === value);
  setCreateVolumeType((item || {}).label || '');
};
