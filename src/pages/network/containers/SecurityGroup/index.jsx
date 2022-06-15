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

import { observer, inject } from 'mobx-react';
import Base from 'containers/List';
import globalSecurityGroupStore, {
  SecurityGroupStore,
} from 'stores/neutron/security-group';
import { emptyActionConfig } from 'utils/constants';
import actionConfigs from './actions';

export class SecurityGroups extends Base {
  init() {
    this.store = globalSecurityGroupStore;
    this.downloadStore = new SecurityGroupStore();
  }

  get policy() {
    return 'get_security_group';
  }

  get name() {
    return t('security groups');
  }

  get isRecycleBinDetail() {
    return this.inDetailPage && this.path.includes('recycle-bin');
  }

  get actionConfigs() {
    if (this.isRecycleBinDetail) {
      return emptyActionConfig;
    }
    return this.isAdminPage
      ? actionConfigs.actionConfigsAdmin
      : actionConfigs.actionConfigs;
  }

  get isFilterByBackend() {
    return true;
  }

  get fetchDataByCurrentProject() {
    return true;
  }

  get adminPageHasProjectFilter() {
    return true;
  }

  getColumns = () => [
    {
      title: t('ID/Name'),
      dataIndex: 'name',
      routeName: this.getRouteName('securityGroupDetail'),
    },
    {
      title: t('Project ID/Name'),
      dataIndex: 'project_name',
      isHideable: true,
      hidden: !this.isAdminPage,
    },
    {
      title: t('Description'),
      dataIndex: 'description',
      isHideable: true,
    },
    {
      title: t('Created At'),
      dataIndex: 'created_at',
      valueRender: 'sinceTime',
    },
  ];

  get searchFilters() {
    return [
      {
        label: t('Name'),
        name: 'name',
      },
    ];
  }
}

export default inject('rootStore')(observer(SecurityGroups));
