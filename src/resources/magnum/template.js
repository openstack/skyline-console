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

import { flavorArchitectures, flavorCategoryList } from 'resources/nova/flavor';
import { formatSize } from 'utils';

export const getBaseTemplateColumns = (self) => [
  {
    title: t('ID/Name'),
    dataIndex: 'name',
    routeName: self.getRouteName('containerInfraClusterTemplateDetail'),
  },
  {
    title: t('Project ID/Name'),
    dataIndex: 'project_name',
    isHideable: true,
    hidden: !self.isAdminPage,
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
    hidden: self.isAdminPage,
    render: (value) => {
      if (value) {
        return self.getLinkRender('keypairDetail', value, { id: value });
      }
      return value || '-';
    },
  },
];

export const getBaseSimpleFlavorColumns = (self) => [
  {
    title: t('ID/Name'),
    dataIndex: 'name',
    routeName: self ? self.getRouteName('flavorDetail') : '',
  },
  {
    title: t('Architecture'),
    dataIndex: 'architecture',
    valueMap: flavorArchitectures,
  },
  {
    title: t('Category'),
    dataIndex: 'category',
    render: (value) => flavorCategoryList[value] || value || '-',
  },
  {
    title: t('CPU'),
    dataIndex: 'vcpus',
    isHideable: true,
  },
  {
    title: t('Memory'),
    dataIndex: 'ram',
    isHideable: true,
    render: (ram) => formatSize(ram, 2),
  },
];
