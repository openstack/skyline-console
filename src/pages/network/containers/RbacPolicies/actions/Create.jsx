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
import Notify from 'src/components/Notify';
import { RbacPoliciesStore } from 'src/stores/neutron/rbac-policies';
import { ProjectStore } from 'stores/keystone/project';
import { NetworkStore } from 'stores/neutron/network';
import { QoSPolicyStore } from 'stores/neutron/qos-policy';
import { observable } from 'mobx';

export class Create extends ModalAction {
  static id = 'create-policy';

  static title = t('Create');

  @observable allNetworks;

  @observable allProjects;

  get name() {
    return t('Create');
  }

  init() {
    this.state = {
      ...this.state,
      isReady: false,
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

  get tips() {
    return t('From here you can create a rbac policy.');
  }

  async getProjects() {
    this.allProjects = await this.projectStore.pureFetchList();
    this.addNewElementToProjectList();
  }

  addNewElementToProjectList() {
    const newElement = {
      id: '*',
      name: '*',
    };
    this.allProjects.unshift(newElement);
  }

  async getQoSPolicy() {
    await this.qosPolicyStore.fetchList();
  }

  async getNetworks() {
    this.allNetworks = await this.networkStore.pureFetchList();
  }

  get projects() {
    return (this.allProjects || []).map((it) => ({
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

  get networks() {
    return (this.allNetworks || []).map((it) => ({
      value: it.id,
      label: it.name,
    }));
  }

  onSubmit = async (values) => {
    try {
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

      await this.store.create(body);
    } catch (error) {
      Notify.errorWithDetail(null, error.toString());
      return Promise.reject(error);
    }
  };

  static allowed = () => Promise.resolve(true);

  get createObjectList() {
    return [
      { value: 'network', label: t('Shared Network') },
      { value: 'external-network', label: t('External Network') },
      { value: 'qos_policy', label: t('Shared QoS Policy') },
    ];
  }

  onChangeHandler = async (value) => {
    this.setState({
      object_type: value,
    });
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
        label: t('Action and Object Type'),
        placeholder: t('Select action and object type'),
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
        options: this.networks,
        hidden: !isNetwork,
        isLoading: !this.state.isReady,
        onChange: this.onSourceEnvironmentChange,
        required: true,
      },
      {
        name: 'object_id',
        label: t('External Network'),
        placeholder: t('Select a network'),
        type: 'select',
        options: this.networks,
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
