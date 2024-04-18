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
import globalServerStore from 'stores/nova/instance';
import { PortStore } from 'stores/neutron/port-extension';
import { SecurityGroupStore } from 'stores/neutron/security-group';
import { portStatus } from 'resources/neutron/port';
import {
  securityGroupColumns,
  securityGroupFilter,
} from 'resources/neutron/security-group';
import { toJS } from 'mobx';

export class ManageSecurityGroup extends ModalAction {
  static id = 'manage-security-group';

  static title = t('Manage Security Group');

  static allowed = () => Promise.resolve(true);

  init() {
    this.store = globalServerStore;
    this.securityGroupStore = new SecurityGroupStore();
    this.portStore = new PortStore();
    this.getPorts();
    this.securityGroupMap = {};
  }

  static policy = 'update_port';

  getPorts() {
    this.portStore.fetchList({ device_id: this.item.id });
  }

  get ports() {
    const portsBeauty = toJS(this.portStore.list.data) || [];
    return portsBeauty.map((port) => {
      return {
        ...port,
        name: port.id,
        security_groups: port.origin_data.security_groups,
      };
    });
  }

  getSecurityGroupPromise = async (id) => {
    if (!this.securityGroupMap[id]) {
      const result = await this.securityGroupStore.fetchDetail({ id });
      this.securityGroupMap[id] = result;
    }
    return this.securityGroupMap[id];
  };

  static get modalSize() {
    return 'large';
  }

  getModalSize() {
    return 'large';
  }

  get name() {
    return t('Manage Security Group');
  }

  get defaultValue() {
    const { name } = this.item;
    const { port } = this.state;
    const value = {
      name,
    };
    if (port) {
      value.securityGroup = {
        selectedRowKeys: port.security_groups,
      };
      value.port = {
        selectedRowKeys: [port.id],
      };
    }
    return value;
  }

  onPortChange = async (value) => {
    const { selectedRows = [] } = value;
    const port = selectedRows[0];
    if (!port) {
      return;
    }
    const { security_groups: securityGroups = [] } = port;
    const sgs = await Promise.all(
      securityGroups.map((id) => this.getSecurityGroupPromise(id))
    );
    this.formRef.current.setFieldsValue({
      securityGroup: {
        selectedRowKeys: securityGroups,
      },
    });
    this.setState({
      sgInitValue: {
        selectedRowKeys: securityGroups,
        port,
        selectedRows: sgs,
      },
    });
  };

  get formItems() {
    const { sgInitValue = {} } = this.state;
    return [
      {
        name: 'name',
        label: t('Instance'),
        type: 'label',
        iconType: 'instance',
      },
      {
        name: 'port',
        label: t('Virtual Adapter'),
        type: 'select-table',
        required: true,
        data: this.ports,
        isLoading: this.portStore.list.isLoading,
        isMulti: false,
        onChange: this.onPortChange,
        disabledFunc: (record) => !record.port_security_enabled,
        filterParams: [
          {
            label: t('Owned Network'),
            name: 'network_name',
          },
        ],
        columns: [
          {
            title: t('ID'),
            dataIndex: 'id',
          },
          {
            title: t('Owned Network'),
            dataIndex: 'network_name',
          },
          {
            title: t('IPv4 Address'),
            dataIndex: 'ipv4',
            render: (value) => value.map((it) => <div key={it}>{it}</div>),
          },
          {
            title: t('IPv6 Address'),
            dataIndex: 'ipv6',
            render: (value) => value.map((it) => <div key={it}>{it}</div>),
          },
          {
            title: t('Mac Address'),
            dataIndex: 'mac_address',
            isHideable: true,
          },
          {
            title: t('Status'),
            dataIndex: 'status',
            render: (value) => portStatus[value] || value,
          },
        ],
      },
      {
        name: 'securityGroup',
        label: t('Security Group'),
        type: 'select-table',
        initValue: sgInitValue,
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
    const {
      securityGroup: { selectedRowKeys: security_groups = [] } = {},
      port: { selectedRowKeys = [] },
    } = values;
    const id = selectedRowKeys[0];
    const reqBody = { port: { security_groups } };
    return this.securityGroupStore.updatePortSecurityGroup({ id, reqBody });
  };
}

export default inject('rootStore')(observer(ManageSecurityGroup));
