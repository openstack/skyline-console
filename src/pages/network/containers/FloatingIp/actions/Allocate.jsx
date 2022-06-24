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

import React from 'react';
import { inject, observer } from 'mobx-react';
import { ModalAction } from 'containers/Action';
import { FloatingIpStore } from 'stores/neutron/floatingIp';
import { NetworkStore } from 'stores/neutron/network';
import globalProjectStore from 'stores/keystone/project';
import globalSubnetStore from 'stores/neutron/subnet';
import { QoSPolicyStore } from 'stores/neutron/qos-policy';
import { getQoSPolicyTabs } from 'resources/neutron/qos-policy';
import { qosEndpoint } from 'client/client/constants';

export class Allocate extends ModalAction {
  static id = 'allocate';

  static title = t('Allocate IP');

  get name() {
    return t('Allocate IP');
  }

  static get modalSize() {
    return qosEndpoint() ? 'large' : 'small';
  }

  getModalSize() {
    return qosEndpoint() ? 'large' : 'small';
  }

  get qosEndpoint() {
    return qosEndpoint();
  }

  init() {
    this.store = new FloatingIpStore();
    this.networkStore = new NetworkStore();
    this.qosPolicyStore = new QoSPolicyStore();
    this.projectStore = globalProjectStore;
    this.state = {
      ...(this.state || {}),
      selectedNetwork: null,
      selectedSubnet: null,
      networks: [],
      subnets: [],
      qosPolicy: null,
      count: 2,
      quota: {},
      quotaLoading: true,
      projectId: this.currentProjectId,
      maxCount: 2,
    };
    this.getExternalNetworks();
    this.isAdminPage && globalProjectStore.fetchList();
    this.getQuota();
  }

  async getExternalNetworks() {
    const networks = await this.networkStore.pureFetchList({
      'router:external': true,
    });
    this.setState({
      networks,
    });
  }

  get messageHasItemName() {
    return false;
  }

  static policy = 'create_floatingip';

  static allowed = () => Promise.resolve(true);

  static get disableSubmit() {
    const {
      neutronQuota: { floatingip: { left = 0 } = {} },
    } = globalProjectStore;
    return left === 0;
  }

  static get showQuota() {
    return true;
  }

  get showQuota() {
    return true;
  }

  async getQuota() {
    const { projectId, count } = this.state;
    this.setState({
      quotaLoading: true,
    });
    const result = await this.projectStore.fetchProjectNeutronQuota(projectId);
    const { floatingip: quota = {} } = result || {};
    const { left = 0 } = quota;
    this.setState({
      quota,
      quotaLoading: false,
      maxCount: left,
    });
    let newCount = count;
    if (left < count) {
      newCount = left;
    } else if (left > 0 && count === 0) {
      newCount = 1;
    }
    if (newCount !== count) {
      this.updateFormValue('count', newCount);
      this.setState({
        count: newCount,
      });
    }
  }

  get quotaInfo() {
    const {
      quota = {},
      quotaLoading,
      batchAllocate = false,
      count,
    } = this.state;
    if (quotaLoading) {
      return [];
    }
    const { left = 0 } = quota;
    let add = 0;
    if (left !== 0) {
      add = batchAllocate ? count : 1;
    }
    const data = {
      ...quota,
      add,
      name: 'floatingip',
      title: t('Floating IP'),
    };
    return [data];
  }

  get defaultValue() {
    return {
      project_id: this.currentProjectId,
      count: 2,
    };
  }

  handleNetworkChange = async (networkId) => {
    const subnets = await globalSubnetStore.fetchList({
      network_id: networkId,
    });
    this.setState({
      subnets: subnets.map((item) => ({
        allocation_pools: item.allocation_pools,
        ip_version: item.ip_version,
        value: item.id,
        label: item.name,
      })),
      selectedNetwork: networkId,
    });
    this.formRef.current.setFieldsValue({
      subnet_id: null,
    });
  };

  handleSubnetChange = (option) => {
    this.setState({
      selectedSubnet: option,
    });
  };

  onSubmit = ({ subnet_id, batch_allocate, count, qos_policy_id, ...rest }) => {
    const data = rest;
    if (subnet_id) {
      data.subnet_id = subnet_id.value;
    }
    if (qos_policy_id && qos_policy_id.selectedRowKeys.length > 0) {
      data.qos_policy_id = qos_policy_id.selectedRowKeys[0];
    }
    if (batch_allocate) {
      data.floating_ip_address = null;
      const promises = [];
      for (let i = 0; i < count; i++) {
        promises.push(this.store.create(data));
      }
      return Promise.all(promises);
    }
    return this.store.create(data);
  };

  onCountChange = (value) => {
    this.setState({
      count: value,
    });
  };

  onProjectChange = (value) => {
    this.setState(
      {
        projectId: value,
      },
      () => {
        this.getQuota();
      }
    );
  };

  get formItems() {
    const {
      networks,
      selectedNetwork,
      subnets,
      selectedSubnet,
      batchAllocate = false,
      maxCount,
    } = this.state;
    const networkItems = networks.map((item) => ({
      label: item.name,
      value: item.id,
    }));
    const projectOptions = globalProjectStore.list.data.map((project) => ({
      label: project.name,
      value: project.id,
    }));
    return [
      {
        name: 'floating_network_id',
        label: t('Network'),
        type: 'select',
        options: networkItems,
        onChange: this.handleNetworkChange,
        required: true,
      },
      {
        name: 'project_id',
        label: t('Project'),
        type: 'select',
        showSearch: true,
        hidden: !this.isAdminPage,
        required: this.isAdminPage,
        options: projectOptions,
        onChange: this.onProjectChange,
      },
      {
        name: 'subnet_id',
        label: t('Owned Subnet'),
        type: 'select',
        options: subnets,
        isWrappedValue: true,
        onChange: (option) => this.handleSubnetChange(option),
        extra: selectedSubnet && (
          <>
            <span>{t('Allocation Pools')}</span>
            {selectedSubnet.allocation_pools.map((pool, index) => (
              <div key={`pool.start.${index}`}>
                {pool.start}--{pool.end}
              </div>
            ))}
          </>
        ),
        hidden: !selectedNetwork,
        required: false,
      },
      {
        name: 'batch_allocate',
        label: t('Batch Allocate'),
        type: 'check',
        onChange: (e) => {
          this.setState({
            batchAllocate: e,
          });
        },
      },
      {
        name: 'count',
        label: t('Count'),
        type: 'input-int',
        min: 1,
        max: maxCount,
        hidden: !batchAllocate,
        required: true,
        onChange: this.onCountChange,
      },
      {
        name: 'floating_ip_address',
        label: t('Floating IP Address'),
        hidden: !selectedSubnet || batchAllocate,
        type: 'ip-input',
        version: selectedSubnet && (selectedSubnet.ip_version || 4),
      },
      {
        name: 'description',
        label: t('Description'),
        type: 'textarea',
      },
      {
        name: 'qos_policy_id',
        label: t('QoS Policy'),
        type: 'tab-select-table',
        tabs: getQoSPolicyTabs.call(this),
        isMulti: false,
        tip: t('Choosing a QoS policy can limit bandwidth and DSCP'),
        onChange: this.onQosChange,
        display: !!this.qosEndpoint,
      },
    ];
  }
}

export default inject('rootStore')(observer(Allocate));
