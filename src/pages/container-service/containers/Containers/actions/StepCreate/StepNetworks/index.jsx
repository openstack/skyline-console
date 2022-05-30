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

import { SecurityGroupStore } from 'stores/neutron/security-group';
import { VirtualAdapterStore } from 'stores/neutron/virtual-adapter';
import Base from 'components/Form';
import { inject, observer } from 'mobx-react';
import globalNetworkStore from 'src/stores/neutron/network';
import { portColumns, portFilters } from 'src/resources/neutron/port';
import {
  securityGroupColumns,
  securityGroupFilter,
} from 'src/resources/neutron/security-group';

export class StepNetworks extends Base {
  init() {
    this.getNetworkStore();
    this.portStore = new VirtualAdapterStore();
    this.securityGroupStore = new SecurityGroupStore();
  }

  get title() {
    return t('Networks');
  }

  get name() {
    return t('Networks');
  }

  async getNetworkStore() {
    await globalNetworkStore.fetchList({ project_id: this.currentProjectId });
  }

  get networking() {
    return (globalNetworkStore.list.data || []).map((it) => ({
      label: it.name,
      value: it.id,
    }));
  }

  get formItems() {
    return [
      {
        name: 'networkSelect',
        label: t('Networks'),
        type: 'network-select-table',
        isMulti: true,
      },
      {
        name: 'ports',
        type: 'select-table',
        label: t('Ports'),
        isMulti: true,
        columns: portColumns,
        filterParams: portFilters,
        backendPageStore: this.portStore,
        extraParams: {
          project_id: this.currentProjectId,
          device_owner: [''],
          admin_state_up: [true],
        },
      },
      {
        name: 'securityGroup',
        label: t('Security Group'),
        type: 'select-table',
        backendPageStore: this.securityGroupStore,
        extraParams: { project_id: this.currentProjectId },
        columns: securityGroupColumns,
        filterParams: securityGroupFilter,
        isMulti: true,
      },
    ];
  }
}

export default inject('rootStore')(observer(StepNetworks));
