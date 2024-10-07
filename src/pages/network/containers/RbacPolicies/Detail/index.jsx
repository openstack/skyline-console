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
import Base from 'containers/TabDetail';
import actionConfigs from 'src/pages/network/containers/RbacPolicies/actions';
import { RbacPoliciesStore } from 'src/stores/neutron/rbac-policies';
import Detail from './Detail';

export class RbacPolicyDetail extends Base {
  get name() {
    return t('Rbac Policy');
  }

  get listUrl() {
    return this.getRoutePath('rbacPolicy');
  }

  get actionConfigs() {
    return actionConfigs;
  }

  get detailInfos() {
    return [
      {
        title: t('Project ID'),
        dataIndex: 'project_id',
      },
    ];
  }

  get tabs() {
    const tabs = [
      {
        title: t('Detail'),
        key: 'rbacPolicyDetailAdmin',
        component: Detail,
      },
    ];
    return tabs;
  }

  init() {
    this.store = new RbacPoliciesStore();
  }
}

export default inject('rootStore')(observer(RbacPolicyDetail));
