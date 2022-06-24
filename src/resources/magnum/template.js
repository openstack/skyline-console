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

export const admission_control_list =
  'NodeRestriction,NamespaceLifecycle,LimitRanger,ServiceAccount,ResourceQuota,TaintNodesByCondition,Priority,DefaultTolerationSeconds,DefaultStorageClass,StorageObjectInUseProtection,PersistentVolumeClaimResize,MutatingAdmissionWebhook,ValidatingAdmissionWebhook,RuntimeClass';

export const getBaseTemplateColumns = (self) => [
  {
    title: t('ID/Name'),
    dataIndex: 'name',
    routeName: self.getRouteName('containerInfraClusterTemplateDetail'),
  },
  {
    title: t('COE'),
    isHideable: true,
    dataIndex: 'coe',
  },
  {
    title: t('Network Driver'),
    isHideable: true,
    dataIndex: 'network_driver',
  },
  {
    title: t('Keypair'),
    isHideable: true,
    dataIndex: 'keypair_id',
    render: (value) => {
      return value
        ? self.getLinkRender('keypairDetail', value, { id: value })
        : '-';
    },
  },
];
