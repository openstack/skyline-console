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
import { FormOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { NetworkStore } from 'stores/neutron/network';
import { SecurityGroupStore } from 'stores/neutron/security-group';
import { QoSPolicyStore } from 'stores/neutron/qos-policy';
import globalPortStore from 'stores/neutron/port-extension';
import globalProjectStore from 'stores/keystone/project';
import { SubnetStore } from 'stores/neutron/subnet';
import { getQoSPolicyTabs } from 'resources/neutron/qos-policy';
import { qosEndpoint } from 'client/client/constants';

const portTypes =
  'normal,macvtap,direct,baremetal,direct-physical,virtio-forwarder,smart-nic';

export class CreateAction extends ModalAction {
  static id = 'create-virtual-adapter';

  static title = t('Create Virtual Adapter');

  get qosEndpoint() {
    return qosEndpoint();
  }

  init() {
    this.state.quota = {};
    this.state.quotaLoading = true;
    this.projectStore = globalProjectStore;
    this.networkStore = new NetworkStore();
    this.securityGroupStore = new SecurityGroupStore();
    this.qosPolicyStore = new QoSPolicyStore();
    this.subnetStore = new SubnetStore();
    this.getQuota();
    // this.getSecurityGroups();
    // this.isAdminPage && globalProjectStore.fetchList();
  }

  async getSubnets(value) {
    await this.networkStore.fetchDetail({ id: value });
    await this.fetchSubnetDetails(value);
  }

  fetchSubnetDetails = async (network_id) => {
    const ret = await this.subnetStore.fetchList({ network_id });
    this.setState({
      subnetDetails: ret || [],
    });
  };

  get name() {
    return t('Create Virtual Adapter');
  }

  static get modalSize() {
    return 'large';
  }

  getModalSize() {
    return 'large';
  }

  get tips() {
    return t(
      'Virtual adapter mainly used for binding instance and other operations, occupying the quota of the port.'
    );
  }

  static get disableSubmit() {
    const {
      neutronQuota: { port: { used = 0, limit = 0 } = {} },
    } = globalProjectStore;
    return limit !== -1 && used >= limit;
  }

  static get showQuota() {
    return true;
  }

  get showQuota() {
    return true;
  }

  async getQuota() {
    this.setState({
      quotaLoading: true,
    });
    const result = await this.projectStore.fetchProjectNeutronQuota();
    const { port: quota = {} } = result || {};
    this.setState({
      quota,
      quotaLoading: false,
    });
  }

  get quotaInfo() {
    const { quota = {}, quotaLoading } = this.state;
    if (quotaLoading) {
      return [];
    }
    const { used = 0, limit = 0 } = quota;
    const add = limit !== -1 && used >= limit ? 0 : 1;
    const data = {
      ...quota,
      add,
      name: 'port',
      title: t('Ports'),
    };
    return [data];
  }

  get defaultValue() {
    const data = {
      // project_id: this.currentProjectId,
      more: false,
      mac_address: { type: 'auto' },
      qos_policy: 'disable',
      port_security_enabled: true,
      enableQosPolicy: false,
    };
    return data;
  }

  get securityGroups() {
    return (this.securityGroupStore.list.data || []).map((it) => ({
      ...it,
      key: it.id,
    }));
  }

  handleOwnedNetworkChange = (value) => {
    const network_id = value.selectedRowKeys[0];
    this.setState({
      network_id,
    });
    // Reset owned subnets after change owned network
    this.formRef.current.setFieldsValue({
      fixed_ips: undefined,
    });
    this.getSubnets(network_id);
  };

  static policy = 'create_port';

  static allowed = () => Promise.resolve(true);

  onSubmit = (values) => {
    const {
      mac_address: { type, mac },
      security_groups,
      enableQosPolicy,
      qos_policy_id,
      more,
      network_id,
      fixed_ips,
      bindingProfile,
      ...rest
    } = values;
    const data = {
      ...(fixed_ips && fixed_ips.length > 0
        ? {
            fixed_ips: fixed_ips.map((i) => {
              const ret = {
                subnet_id: i.subnet,
              };
              if (i.ip_address && i.ip_address.type === 'manual') {
                ret.ip_address = i.ip_address.ip;
              }
              return ret;
            }),
          }
        : {}),
      network_id: network_id.selectedRowKeys[0],
      ...rest,
    };
    type && type !== 'auto' && (data.mac_address = mac);
    if (enableQosPolicy) {
      qos_policy_id &&
        (data.qos_policy_id =
          qos_policy_id.selectedRowKeys.length === 0
            ? null
            : qos_policy_id.selectedRowKeys[0]);
    }
    security_groups &&
      (data.security_groups = security_groups.selectedRowKeys || undefined);
    data.project_id = this.currentProjectId;
    bindingProfile && (data['binding:profile'] = JSON.parse(bindingProfile));
    return globalPortStore.create(data);
  };

  get formItems() {
    const {
      more,
      network_id,
      subnetDetails = [],
      port_security_enabled = true,
      enableQosPolicy = false,
    } = this.state;
    const portTypeItems = portTypes.split(',').map((item) => ({
      label: item,
      value: item,
    }));
    // const projectOptions = globalProjectStore.list.data.map(project => ({
    //   label: project.name,
    //   value: project.id,
    // }));
    return [
      {
        name: 'name',
        label: t('Name'),
        type: 'input-name',
        required: true,
        withoutChinese: true,
      },
      {
        name: 'description',
        label: t('Description'),
        type: 'textarea',
        required: false,
      },
      // {
      //   name: 'project_id',
      //   label: t('Project'),
      //   type: 'select',
      //   showSearch: true,
      //   hidden: !this.isAdminPage,
      //   required: this.isAdminPage,
      //   options: projectOptions,
      // },
      {
        name: 'network_id',
        label: t('Owned Network'),
        type: 'network-select-table',
        onChange: this.handleOwnedNetworkChange,
        required: true,
      },
      {
        name: 'fixed_ips',
        label: t('Owned Subnet'),
        type: 'ip-distributor',
        subnets: subnetDetails,
        hidden: !network_id,
        // required: true,
      },
      {
        name: 'ipv6',
        label: 'IPv6',
        type: 'label',
        style: { marginBottom: 24 },
        content: (
          <span>
            {t('The selected VPC/subnet does not have IPv6 enabled.')}{' '}
            <Button type="link">
              {t('To open')} <FormOutlined />
            </Button>{' '}
          </span>
        ),
        hidden: true,
      },
      {
        name: 'mac_address',
        label: t('Mac Address'),
        wrapperCol: { span: 16 },
        required: true,
        type: 'mac-address',
      },
      // {
      //   name: 'qos_policy',
      //   label: t('Qos Policy'),
      //   type: 'radio',
      //   optionType: 'default',
      //   options: [{
      //     label: t('Disable'), value: 'disable',
      //   }, {
      //     label: t('Enable'), value: 'enable',
      //   }],
      //   hidden: !more,
      // },
      // {
      //   name: 'bandwidth_limit',
      //   label: t('Bandwidth limit'),
      //   type: 'slider-input',
      //   max: 1000,
      //   min: 1,
      //   inputMin: 1,
      //   inputMax: 1000,
      //   description: '1Mbps-1000Mbps',
      //   hidden: !(more && qosPolicyEnable),
      //   required: qosPolicyEnable,
      // },
      {
        name: 'port_security_enabled',
        label: t('Port Security'),
        type: 'switch',
        tip: t(
          'Disabling port security will turn off the security group policy protection and anti-spoofing protection on the port. General applicable scenarios: NFV or operation and maintenance Debug.'
        ),
        onChange: (e) => {
          this.setState({
            port_security_enabled: e,
          });
        },
      },
      {
        name: 'security_groups',
        label: t('Security Group'),
        type: 'select-table',
        tips: t(
          'The security group is similar to the firewall function for setting up network access control, or you can go to the console and create a new security group. (Note: The security group you selected will work on all virtual LANs on the instances.)'
        ),
        data: this.securityGroups,
        isLoading: this.securityGroupStore.list.isLoading,
        extraParams: { project_id: this.currentProjectId },
        backendPageStore: this.securityGroupStore,
        isMulti: true,
        hidden: !port_security_enabled,
        required: port_security_enabled,
        // required: true,
        filterParams: [
          {
            label: t('Name'),
            name: 'name',
          },
        ],
        columns: [
          {
            title: t('Name'),
            dataIndex: 'name',
          },
          {
            title: t('Description'),
            dataIndex: 'description',
          },
          {
            title: t('Created At'),
            dataIndex: 'created_at',
            valueRender: 'toLocalTime',
          },
        ],
      },
      {
        name: 'binding:vnic_type',
        label: t('Port Type'),
        type: 'select',
        options: portTypeItems,
        hidden: !more,
      },
      {
        name: 'enableQosPolicy',
        label: t('Enable QoS Policy'),
        type: 'switch',
        onChange: (e) => {
          this.setState({
            enableQosPolicy: e,
          });
        },
        hidden: !more,
        display: !!this.qosEndpoint,
      },
      {
        name: 'qos_policy_id',
        label: t('QoS Policy'),
        type: 'tab-select-table',
        tabs: getQoSPolicyTabs.call(this),
        isMulti: false,
        required: enableQosPolicy,
        tip: t('Choosing a QoS policy can limit bandwidth and DSCP'),
        hidden: !(more && enableQosPolicy),
        display: !!this.qosEndpoint,
      },
      {
        name: 'bindingProfile',
        label: t('Binding Profile'),
        type: 'aceEditor',
        hidden: !more,
        mode: 'json',
        wrapEnabled: true,
        tabSize: 2,
        width: '100%',
        height: '200px',
        setOptions: {
          enableBasicAutocompletion: true,
          enableLiveAutocompletion: true,
          enableSnippets: true,
        },
        validator: (item, value) => {
          if (value !== undefined && value !== '') {
            try {
              JSON.parse(value);
              return Promise.resolve(true);
            } catch (e) {
              return Promise.reject(new Error(t('Illegal JSON scheme')));
            }
          }
          return Promise.resolve(true);
        },
      },
      // {
      //   name: 'description',
      //   label: t('Description'),
      //   type: 'textarea',
      //   hidden: !more,
      // },
      {
        name: 'more',
        label: t('Advanced Options'),
        type: 'more',
      },
    ];
  }
}

export default inject('rootStore')(observer(CreateAction));
