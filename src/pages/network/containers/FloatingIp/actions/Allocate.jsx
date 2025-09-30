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
import { projectTableOptions } from 'resources/keystone/project';
import { isAdminPage } from 'utils';
import { toJS } from 'mobx';
import { checkPolicyRule } from 'resources/skyline/policy';

export class Allocate extends ModalAction {
  static id = 'allocate';

  static title = t('Allocate IP');

  get name() {
    return t('Allocate IP');
  }

  static get modalSize() {
    const { pathname } = window.location;
    return qosEndpoint() || isAdminPage(pathname) ? 'large' : 'small';
  }

  getModalSize() {
    return qosEndpoint() || this.isAdminPage ? 'large' : 'small';
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
    this.isAdminPage && this.fetchProjectList();
    this.getQuota();
  }

  async fetchProjectList() {
    await this.projectStore.fetchProjectsWithDomain();
    this.updateDefaultValue();
  }

  async getExternalNetworks() {
    const networks = await this.networkStore.pureFetchList({
      'router:external': true,
    });
    this.setState(
      {
        networks,
      },
      () => {
        if (networks && networks.length > 0) {
          const firstId = networks[0].id;
          if (this.formRef && this.formRef.current) {
            this.formRef.current.setFieldsValue({
              floating_network_id: firstId,
            });
          }
          this.handleNetworkChange(firstId);
        }
      }
    );
  }

  get messageHasItemName() {
    return false;
  }

  get projects() {
    return toJS(this.projectStore.list.data) || [];
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
    const values = {
      count: 2,
    };
    if (this.isAdminPage) {
      values.project_id = {
        selectedRowKeys: [this.currentProjectId],
      };
    }
    return values;
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

  onSubmit = ({
    subnet_id,
    batch_allocate,
    count,
    qos_policy_id,
    project_id,
    ...rest
  }) => {
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
    return this.store.create({
      ...data,
      project_id: project_id
        ? project_id.selectedRowKeys[0]
        : this.currentProjectId,
    });
  };

  onCountChange = (value) => {
    this.setState({
      count: value,
    });
  };

  onProjectChange = (value) => {
    const { selectedRowKeys } = value;
    this.setState(
      {
        projectId: selectedRowKeys[0],
      },
      () => {
        this.getQuota();
      }
    );
  };

  canSpecifyFloatingIp() {
    return (
      checkPolicyRule('create_floatingip') &&
      checkPolicyRule('create_floatingip:floating_ip_address')
    );
  }

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
        type: 'select-table',
        hidden: !this.isAdminPage,
        required: this.isAdminPage,
        isLoading: this.projectStore.list.isLoading,
        data: this.projects,
        onChange: this.onProjectChange,
        ...projectTableOptions,
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
        display: this.canSpecifyFloatingIp(),
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
