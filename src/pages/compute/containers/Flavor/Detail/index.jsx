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

import { inject, observer } from 'mobx-react';
import { FlavorStore } from 'stores/nova/flavor';
import Base from 'containers/TabDetail';
import { flavorCategoryList, flavorArchitectures } from 'resources/nova/flavor';
import Members from 'pages/compute/containers/Instance';
import { emptyActionConfig } from 'utils/constants';
import { formatSize } from 'utils';
import actionConfigs from '../actions';
import BaseDetail from './BaseDetail';

export class Detail extends Base {
  get name() {
    return t('flavor');
  }

  get policy() {
    return 'os_compute_api:os-flavor-extra-specs:index';
  }

  get listUrl() {
    return this.getRoutePath('flavor');
  }

  get actionConfigs() {
    return this.isAdminPage ? actionConfigs : emptyActionConfig;
  }

  get detailInfos() {
    return [
      {
        title: t('Name'),
        dataIndex: 'name',
      },
      {
        title: t('Architecture'),
        dataIndex: 'architecture',
        valueMap: flavorArchitectures,
      },
      {
        title: t('Category'),
        dataIndex: 'category',
        valueMap: flavorCategoryList,
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
      {
        title: t('Public'),
        dataIndex: 'is_public',
        isHideable: true,
        valueRender: 'yesNo',
      },
    ];
  }

  get tabs() {
    const tabs = [
      {
        title: t('Detail'),
        key: 'detail',
        component: BaseDetail,
      },
      {
        title: t('Instances'),
        key: 'members',
        component: Members,
      },
    ];
    return tabs;
  }

  init() {
    this.store = new FlavorStore();
  }
}

export default inject('rootStore')(observer(Detail));
