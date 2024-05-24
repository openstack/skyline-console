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
import { RbacPoliciesStore } from 'src/stores/neutron/rbac-policies';
import actionConfigRbacPolicies from './actions';

export class RbacPolicies extends Base {
  init() {
    this.store = new RbacPoliciesStore();
    this.downloadStore = new RbacPoliciesStore();
  }

  get hasTab() {
    return false;
  }

  get name() {
    return t('RBAC Policies');
  }

  get actionConfigs() {
    return actionConfigRbacPolicies;
  }

  getColumns = () => {
    const columns = [
      {
        title: t('Project'),
        dataIndex: 'project_name',
      },
      {
        title: t('ID'),
        dataIndex: 'id',
        routeName: this.getRouteName('rbacPolicyDetail'),
        isLink: true,
      },
      {
        title: t('Object Type'),
        dataIndex: 'object_type',
      },
      {
        title: t('Object'),
        dataIndex: 'object_name',
      },
      {
        title: t('Target Project'),
        dataIndex: 'target_tenant_name',
      },
    ];
    return columns;
  };

  get objectTypes() {
    return [
      { key: 'network', label: t('Network') },
      { key: 'qos_policy', label: t('QoS Policy') },
    ];
  }

  get searchFilters() {
    return [
      {
        label: t('Project'),
        name: 'project_name',
      },
      {
        label: t('Id'),
        name: 'id',
      },
      {
        label: t('Target Project'),
        name: 'target_tenant_name',
      },
      {
        label: t('Object Type'),
        name: 'object_type',
        options: this.objectTypes,
      },
      {
        label: t('Object'),
        name: 'object_name',
      },
    ];
  }
}

export default inject('rootStore')(observer(RbacPolicies));
