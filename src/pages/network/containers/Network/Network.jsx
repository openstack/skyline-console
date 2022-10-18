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
import { networkColumns } from 'resources/neutron/network';
import { NetworkStore } from 'stores/neutron/network';
import { yesNoOptions } from 'utils/constants';
import actionConfigs from './actions';

export class Networks extends Base {
  init() {
    this.store = new NetworkStore();
    this.downloadStore = new NetworkStore();
  }

  get isFilterByBackend() {
    return true;
  }

  get isSortByBackend() {
    return true;
  }

  get defaultSortKey() {
    return 'status';
  }

  get policy() {
    return 'get_network';
  }

  get name() {
    return t('networks');
  }

  get actionConfigs() {
    return actionConfigs;
  }

  get hasTab() {
    return !this.isAdminPage;
  }

  get adminPageHasProjectFilter() {
    return true;
  }

  get tab() {
    if (this.isAdminPage) {
      return null;
    }
    const { tab = 'projectNetwork' } = this.props;
    return tab;
  }

  get isProjectTab() {
    return this.tab === 'projectNetwork';
  }

  get isSharedTab() {
    return this.tab === 'sharedNetwork';
  }

  get isExternalTab() {
    return this.tab === 'externalNetwork';
  }

  get isAllTab() {
    return this.tab === 'allNetwork';
  }

  updateFetchParamsByPage = (params) => {
    if (this.isAdminPage || this.isAllTab) {
      return {
        ...params,
        all_projects: true,
      };
    }
    if (this.isProjectTab) {
      return {
        ...params,
        project_id: this.currentProjectId,
      };
    }
    if (this.isSharedTab) {
      return {
        ...params,
        shared: true,
      };
    }
    if (this.isExternalTab) {
      return {
        ...params,
        'router:external': true,
      };
    }
    return { ...params };
  };

  getColumns() {
    const columns = networkColumns(this);
    if (this.isAdminPage || this.isAllTab) {
      columns.splice(1, 0, {
        title: t('Project ID/Name'),
        dataIndex: 'project_name',
        isHideable: true,
        sortKey: 'project_id',
      });
      return columns;
    }
    if (this.isProjectTab) {
      return columns.filter((it) => it.dataIndex !== 'tenant_id');
    }
    if (this.isSharedTab) {
      return columns.filter((it) => it.dataIndex !== 'shared');
    }
    if (this.isExternalTab) {
      return columns.filter((it) => it.dataIndex !== 'router:external');
    }
    return columns;
  }

  get searchFilters() {
    const nameFilter = {
      label: t('Name'),
      name: 'name',
    };
    const sharedFilter = {
      label: t('Shared'),
      name: 'shared',
      options: yesNoOptions,
    };
    const externalFilter = {
      label: t('External'),
      name: 'router:external',
      options: yesNoOptions,
    };
    const projectFilter = {
      label: t('Project Range'),
      name: 'project_id',
      options: [
        { label: t('Current Project'), key: this.currentProjectId },
        { label: t('All'), key: 'all' },
      ],
    };
    if (this.isSharedTab) {
      return [nameFilter, externalFilter, projectFilter];
    }
    if (this.isExternalTab) {
      return [nameFilter, sharedFilter, projectFilter];
    }
    return [nameFilter, sharedFilter, externalFilter];
  }
}

export default inject('rootStore')(observer(Networks));
