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
import { RbacPoliciesStore } from 'src/stores/neutron/rbac-policies';
import { ProjectStore } from 'stores/keystone/project';
import { NetworkStore } from 'stores/neutron/network';
import { QoSPolicyStore } from 'stores/neutron/qos-policy';
import { qosEndpoint } from 'client/client/constants';
import { anyProject } from 'resources/neutron/rbac-policy';

export class Create extends ModalAction {
  static id = 'create-policy';

  static title = t('Create RBAC Policy');

  static policy = 'create_rbac_policy';

  get name() {
    return t('Create');
  }

  get messageHasItemName() {
    return false;
  }

  init() {
    this.state = {
      ...this.state,
      isReady: false,
      allNetworks: [],
      qosPolices: [],
    };
    this.store = new RbacPoliciesStore();
    this.projectStore = new ProjectStore();
    this.qosPolicyStore = new QoSPolicyStore();
    this.networkStore = new NetworkStore();
    this.getAllData();
  }

  async getAllData() {
    await Promise.all([
      this.getProjects(),
      this.getQoSPolicy(),
      this.getNetworks(),
    ]);
    this.setState({ isReady: true });
  }

  get enableQosPolicy() {
    return qosEndpoint();
  }

  async getProjects() {
    const allProjects = await this.projectStore.pureFetchList();
    allProjects.unshift(anyProject);
    this.setState({ allProjects });
  }

  async getQoSPolicy() {
    if (!this.enableQosPolicy) {
      return;
    }
    await this.qosPolicyStore.fetchList();
  }

  async getNetworks() {
    const allNetworks = await this.networkStore.pureFetchList();
    this.setState({ allNetworks });
  }

  get projects() {
    const { allProjects } = this.state;
    return (allProjects || []).map((it) => ({
      value: it.id,
      label: it.name,
    }));
  }

  get qosPolicy() {
    return (this.qosPolicyStore.list.data || []).map((it) => ({
      value: it.id,
      label: it.name,
    }));
  }

  get sharedNetworks() {
    const { allNetworks } = this.state;
    return (allNetworks || [])
      .filter((it) => it.shared === true)
      .map((it) => ({
        value: it.id,
        label: it.name,
      }));
  }

  get externalNetworks() {
    const { allNetworks } = this.state;
    return (allNetworks || [])
      .filter((it) => it['router:external'] === true)
      .map((it) => ({
        value: it.id,
        label: it.name,
      }));
  }

  onSubmit = async (values) => {
    const { object_type, ...rest } = values;
    const action =
      object_type === 'network' || object_type === 'qos_policy'
        ? 'access_as_shared'
        : 'access_as_external';
    const updatedType =
      object_type === 'external-network' ? 'network' : object_type;
    const body = {
      ...rest,
      object_type: updatedType,
      action,
    };

    return this.store.create(body);
  };

  static allowed = () => Promise.resolve(true);

  get createObjectList() {
    const items = [
      { value: 'network', label: t('Shared Network') },
      { value: 'external-network', label: t('External Network') },
    ];
    if (this.enableQosPolicy) {
      items.push({ value: 'qos_policy', label: t('Shared QoS Policy') });
    }
    return items;
  }

  onChangeHandler = async (value) => {
    this.setState(
      {
        object_type: value,
      },
      () => {
        this.updateFormValue('object_id', undefined);
      }
    );
  };

  get formItems() {
    const { object_type } = this.state;

    const isNetwork = object_type === 'network';
    const isExternalNetwork = object_type === 'external-network';
    const isQosPolicy = object_type === 'qos_policy';

    return [
      {
        name: 'target_tenant',
        label: t('Target Project'),
        placeholder: t('Select a project'),
        type: 'select',
        options: this.projects,
        isLoading: !this.state.isReady,
        required: true,
      },
      {
        name: 'object_type',
        label: t('Object Type'),
        placeholder: t('Select an object type'),
        type: 'select',
        onChange: this.onChangeHandler,
        options: this.createObjectList,
        required: true,
      },
      {
        name: 'object_id',
        label: t('Shared Network'),
        placeholder: t('Select a network'),
        type: 'select',
        options: this.sharedNetworks,
        hidden: !isNetwork,
        isLoading: !this.state.isReady,
        required: true,
      },
      {
        name: 'object_id',
        label: t('External Network'),
        placeholder: t('Select a network'),
        type: 'select',
        options: this.externalNetworks,
        hidden: !isExternalNetwork,
        isLoading: !this.state.isReady,
        required: true,
      },
      {
        name: 'object_id',
        label: t('QoS Policy'),
        placeholder: t('Select a QoS Policy'),
        type: 'select',
        options: this.qosPolicy,
        hidden: !isQosPolicy,
        isLoading: !this.state.isReady,
        required: true,
      },
    ];
  }
}

export default inject('rootStore')(observer(Create));
