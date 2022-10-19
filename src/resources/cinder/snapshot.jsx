// Copyright 2022 99cloud
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

import globalVolumeTypeStore from 'stores/cinder/volume-type';
import { toJS } from 'mobx';
import { cloneDeep } from 'lodash';

export const volumeTypes = () => {
  return (globalVolumeTypeStore.list.data || []).map((it) => ({
    label: it.name,
    value: it.id,
    originData: toJS(it),
  }));
};

export const getDiskInfo = (detail) => {
  const {
    snapshotDetail: { size = 0 } = {},
    volumeDetail: { volume_type } = {},
    selfBdmData = {},
  } = detail || {};
  const { delete_on_termination } = selfBdmData;
  const deleteType = delete_on_termination ? 1 : 0;
  const deleteTypeLabel = delete_on_termination
    ? t('Deleted with the instance')
    : t('Not deleted with the instance');
  const volumeTypeItem = volumeTypes().find((it) => it.label === volume_type);
  const diskInfo = {
    type: volumeTypeItem?.value,
    typeOption: volumeTypeItem,
    size,
    deleteType,
    deleteTypeLabel,
  };
  return diskInfo;
};

export const getInstanceSnapshotDataDisk = (disk) => {
  const {
    volumeDetail,
    snapshotDetail,
    bdmFormatData: dataDiskBdm = {},
  } = disk || {};
  const instanceSnapshotDataDisk = getDiskInfo({
    volumeDetail,
    snapshotDetail,
    selfBdmData: dataDiskBdm,
  });
  return instanceSnapshotDataDisk;
};

export const getAllDataDisks = ({
  dataDisk = [],
  instanceSnapshotDataVolumes = [],
}) => {
  const allDataDisks = cloneDeep(dataDisk);
  instanceSnapshotDataVolumes?.forEach((i) => {
    const disk = getInstanceSnapshotDataDisk(i) || {};
    allDataDisks.unshift({ value: disk });
  });
  return allDataDisks;
};
