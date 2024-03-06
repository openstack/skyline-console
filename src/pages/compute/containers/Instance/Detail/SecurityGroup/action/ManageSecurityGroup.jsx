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
import { ModalAction } from 'containers/Action';
import globalServerStore from 'stores/nova/instance';
import { SecurityGroupStore } from 'stores/neutron/security-group';
import {
  securityGroupFilter,
  securityGroupColumns,
} from 'resources/neutron/security-group';

export class ManageSecurityGroup extends ModalAction {
  static id = 'manage-security-group';

  static title = t('Manage Security Group');

  static policy = 'update_port';

  static allowed = () => Promise.resolve(true);

  init() {
    this.store = globalServerStore;
    this.securityGroupStore = new SecurityGroupStore();
  }

  static get modalSize() {
    return 'large';
  }

  getModalSize() {
    return 'large';
  }

  get name() {
    return t('Manage Security Group');
  }

  get messageHasItemName() {
    return false;
  }

  get defaultValue() {
    const { filterData = [] } = this.containerProps;
    return {
      securityGroup: {
        selectedRowKeys: filterData.map((it) => it.id),
        selectedRows: filterData,
      },
    };
  }

  get formItems() {
    return [
      {
        name: 'securityGroup',
        label: t('Security Group'),
        type: 'select-table',
        required: true,
        tips: t(
          'The security group is similar to the firewall function for setting up network access control, or you can go to the console and create a new security group. (Note: The security group you selected will work on all virtual LANs on the instances.)'
        ),
        backendPageStore: this.securityGroupStore,
        extraParams: { project_id: this.currentProjectId },
        isMulti: true,
        filterParams: securityGroupFilter,
        columns: securityGroupColumns,
      },
    ];
  }

  onSubmit = (values) => {
    const { securityGroup: { selectedRowKeys: security_groups = [] } = {} } =
      values;
    const { port: id } = this.containerProps;
    const reqBody = { port: { security_groups } };
    return this.securityGroupStore.updatePortSecurityGroup({ id, reqBody });
  };
}

export default inject('rootStore')(observer(ManageSecurityGroup));
