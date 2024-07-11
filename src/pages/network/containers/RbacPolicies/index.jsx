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
import { objectTypes } from 'resources/neutron/rbac-policy';
import { getOptions } from 'utils';
import actionConfigRbacPolicies from './actions';

export class RbacPolicies extends Base {
  init() {
    this.store = new RbacPoliciesStore();
    this.downloadStore = new RbacPoliciesStore();
  }

  get policy() {
    return 'get_rbac_policy';
  }

  get name() {
    return t('RBAC Policies');
  }

  get actionConfigs() {
    return actionConfigRbacPolicies;
  }

  getColumns() {
    const columns = [
      {
        title: t('ID'),
        dataIndex: 'id',
        routeName: this.getRouteName('rbacPolicyDetail'),
        isLink: true,
        withoutName: true,
      },
      {
        title: t('Project ID/Name'),
        dataIndex: 'project_name',
        isHideable: true,
      },
      {
        title: t('Object Type'),
        dataIndex: 'object_type',
        isHideable: true,
        valueMap: objectTypes,
      },
      {
        title: t('Object ID/Name'),
        dataIndex: 'object_name',
        isHideable: true,
        idKey: 'object_id',
        isLink: true,
        getRouteName: (value, record) => {
          const { object_type } = record || {};
          if (object_type === 'network') {
            return this.getRouteName('networkDetail');
          }
          if (object_type === 'qos_policy') {
            return this.getRouteName('networkQosDetail');
          }
          return '';
        },
      },
      {
        title: t('Target Project ID/Name'),
        dataIndex: 'target_tenant_name',
        isHideable: true,
        idKey: 'target_tenant_id',
        routeName: this.getRouteName('projectDetail'),
        isLink: true,
        emptyRender: () => {
          return '*';
        },
      },
    ];
    return columns;
  }

  get objectTypes() {
    return getOptions(objectTypes);
  }

  get searchFilters() {
    return [
      {
        label: t('Id'),
        name: 'id',
      },
      {
        label: t('Target Project ID'),
        name: 'target_tenant',
      },
      {
        label: t('Target Project Name'),
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
      {
        label: t('Project ID'),
        name: 'project_id',
      },
      {
        label: t('Project Name'),
        name: 'project_name',
      },
    ];
  }
}

export default inject('rootStore')(observer(RbacPolicies));
