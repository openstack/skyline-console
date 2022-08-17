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
import globalServerStore, { ServerStore } from 'stores/nova/instance';
import globalRouterStore, { RouterStore } from 'stores/neutron/router';
import ImageType from 'components/ImageType';
import { has, isNull } from 'lodash';
import {
  getRouterSelectTablePropsBackend,
  getCanReachSubnetIdsWithRouterIdInComponent,
} from 'resources/neutron/router';
import globalFloatingIpsStore from 'stores/neutron/floatingIp';
import { PortStore } from 'stores/neutron/port';
import { instanceSelectTablePropsBackend } from 'resources/nova/instance';
import {
  getPortFormItem,
  getPortsAndReasons,
  getPortsForPortFormItem,
} from 'resources/neutron/port';
import {
  getInterfaceWithReason,
  disableFIPAssociate,
} from 'resources/neutron/floatingip';

export class Associate extends ModalAction {
  static id = 'associate';

  static title = t('Associate');

  get name() {
    return t('Associate Floating IP');
  }

  init() {
    this.store = new ServerStore();
    this.routersStore = new RouterStore();
    this.portStore = new PortStore();
    getCanReachSubnetIdsWithRouterIdInComponent.call(this, (router) => {
      const { item } = this;
      return (
        router.external_gateway_info &&
        router.external_gateway_info.network_id === item.floating_network_id
      );
    });
    this.state = {
      instanceFixedIPs: [],
      portFixedIPs: [],
      canReachSubnetIdsWithRouterId: [],
      routerIdWithExternalNetworkInfo: [],
    };
    this.getPorts();
  }

  get instanceName() {
    return this.item.floating_ip_address || this.values.name;
  }

  static get modalSize() {
    return 'large';
  }

  getModalSize() {
    return 'large';
  }

  get instances() {
    return this.store.list.data || [];
  }

  routersDisableFunc = (i) => {
    const { floating_network_id } = this.item;
    return !(
      i.hasExternalGateway &&
      i.external_gateway_info &&
      i.external_gateway_info.network_id === floating_network_id &&
      i.external_gateway_info.external_fixed_ips.length === 0
    );
  };

  portsDisableFunc = (i) => i.fixed_ips.length === 0;

  get resourceTypeMap() {
    return [
      { value: 'instance', label: t('Instance') },
      // { value: 'lb', label: t('Load Balancer') },
      // { value: 'router', label: t('Router') },
      { value: 'port', label: t('Virtual Adapter') },
    ];
  }

  get defaultValue() {
    const { floating_ip_address } = this.item;
    const value = {
      floatingIp: floating_ip_address,
      resourceType: 'instance',
    };
    return value;
  }

  get portDeviceOwner() {
    return [''];
  }

  getPorts() {
    getPortsForPortFormItem.call(this, this.portDeviceOwner);
  }

  onValuesChange = (changedFields) => {
    if (has(changedFields, 'resourceType')) {
      const { resourceType } = changedFields;
      this.setState({
        resourceType,
      });
    }
  };

  handleInstanceSelect = async (data) => {
    this.setState({
      instanceLoading: true,
    });
    if (data.selectedRows.length === 0) {
      this.setState({
        instanceFixedIPs: interfacesWithReasons,
        instanceLoading: false,
      });
      return Promise.resolve().then(() => {
        this.formRef.current.setFieldsValue({
          port: null,
        });
      });
    }
    const { id } = data.selectedRows[0];
    // Get all the interfaces of the instance
    const instanceInterfaces = await globalServerStore.fetchInterfaceList({
      id,
    });
    const interfaces = await getInterfaceWithReason(instanceInterfaces);
    const { canReachSubnetIdsWithRouterId } = this.state;
    const interfacesWithReasons = getPortsAndReasons(
      interfaces,
      canReachSubnetIdsWithRouterId,
      true
    );
    this.setState({
      instanceFixedIPs: interfacesWithReasons,
      instanceLoading: false,
    });
    return Promise.resolve().then(() => {
      this.formRef.current.setFieldsValue({
        port: null,
      });
    });
  };

  handlePortSelect = async (data) => {
    this.setState({
      fixedIpLoading: true,
    });
    const { canReachSubnetIdsWithRouterId } = this.state;
    const interfacesWithReason = await getInterfaceWithReason(
      data.selectedRows
    );
    const portFixedIPs = getPortsAndReasons(
      interfacesWithReason,
      canReachSubnetIdsWithRouterId,
      true
    );

    this.setState({
      portFixedIPs,
      fixedIpLoading: false,
    });
    return Promise.resolve().then(() => {
      this.formRef.current.setFieldsValue({
        fixed_ip_address: null,
      });
    });
  };

  static policy = 'update_floatingip';

  static allowed = (item) =>
    Promise.resolve(
      !disableFIPAssociate(item) &&
        isNull(item.fixed_ip_address) &&
        item.status === 'DOWN' &&
        isNull(item.port_details)
    );

  onSubmit = (values) => {
    const { resourceType } = values;
    const { id } = this.item;
    const data = {};
    data.id = id;
    if (resourceType === 'instance') {
      const { port: { selectedRows = [] } = {} } = values;
      data.port_id = selectedRows[0].port_id;
      data.fixed_ip_address = selectedRows[0].fixed_ip_address;
    } else if (resourceType === 'port') {
      const {
        virtual_adapter: { selectedRows = [] } = {},
        fixed_ip_address: {
          selectedRows: fixedIPAddressSelectedRows = [],
        } = {},
      } = values;
      data.port_id = selectedRows[0].id;
      data.fixed_ip_address = fixedIPAddressSelectedRows[0].fixed_ip_address;
    } else if (resourceType === 'router') {
      const { router } = values;
      const selectedRouter = router.selectedRows[0];
      return globalRouterStore.associateFip({
        id: selectedRouter.id,
        fip: this.item,
        router: selectedRouter,
      });
    }
    return globalFloatingIpsStore.associateFip(data);
  };

  get formItems() {
    // console.log(toJS(this.store.list.data));
    const {
      resourceType = 'instance',
      instanceFixedIPs,
      instanceLoading,
    } = this.state;
    const ret = [
      {
        name: 'floatingIp',
        label: t('Floating Ip'),
        type: 'label',
        iconType: 'floatingIp',
      },
      {
        name: 'resourceType',
        label: t('Resource Type'),
        type: 'radio',
        required: true,
        options: this.resourceTypeMap,
      },
    ];
    switch (resourceType) {
      case 'instance':
        ret.push(
          ...[
            // instance
            {
              name: 'instance',
              label: t('Instance'),
              type: 'select-table',
              required: true,
              backendPageStore: this.store,
              extraParams: { noReminder: true },
              disabledFunc: (item) => item.fixed_addresses.length === 0,
              onChange: this.handleInstanceSelect,
              isMulti: false,
              ...instanceSelectTablePropsBackend,
            },
            {
              name: 'port',
              label: t('Instance IP'),
              type: 'select-table',
              required: true,
              data: instanceFixedIPs,
              isLoading: instanceLoading,
              isMulti: false,
              filterParams: [
                {
                  label: t('Ip Address'),
                  name: 'name',
                },
              ],
              columns: [
                {
                  title: t('Ip Address'),
                  dataIndex: 'name',
                },
                {
                  title: t('Mac Address'),
                  dataIndex: 'mac_address',
                },
                {
                  title: t('Network'),
                  dataIndex: 'network_name',
                },
                {
                  title: t('Reason'),
                  dataIndex: 'reason',
                },
              ],
              disabledFunc: (record) => !record.available,
            },
          ]
        );
        break;
      case 'lb':
        ret.push(
          ...[
            // lb
            {
              name: 'loadbalance',
              label: t('Load Balancer'),
              type: 'select-table',
              required: true,
              // data: this.instances,
              data: [],
              isMulti: false,
              filterParams: [
                {
                  label: t('Name'),
                  name: 'name',
                },
                {
                  label: t('IP'),
                  name: 'private_ip',
                },
              ],
              columns: [
                {
                  title: t('Name'),
                  dataIndex: 'name',
                },
                {
                  title: t('Image'),
                  dataIndex: 'image',
                  render: (value) => <ImageType type={value} title={value} />,
                },
                {
                  title: t('Fixed IP'),
                  dataIndex: 'fixed_addresses',
                  render: (fixed_addresses) =>
                    fixed_addresses.map((it) => (
                      <span key={it}>
                        {it}
                        <br />
                      </span>
                    )),
                },
                {
                  title: t('Floating IP'),
                  dataIndex: 'floating_addresses',
                  render: (floating_addresses) => {
                    if (!floating_addresses) {
                      return '-';
                    }
                    return floating_addresses.map((it) => (
                      <span key={it}>
                        {it}
                        <br />
                      </span>
                    ));
                  },
                },
                {
                  title: t('Flavor'),
                  dataIndex: 'flavor',
                  // render: (flavor) => {
                  //   if (flavor.disk && flavor.ram) {
                  //     return `${flavor.disk}G/${Number.parseInt(flavor.ram / 1024, 10)}G`;
                  //   } else {
                  //     return '-';
                  //   }
                  // },
                },
                {
                  title: t('Created At'),
                  dataIndex: 'created',
                  valueRender: 'sinceTime',
                },
              ],
            },
          ]
        );
        break;
      case 'router':
        ret.push(
          ...[
            // router
            {
              name: 'router',
              label: t('Router'),
              type: 'select-table',
              required: true,
              backendPageStore: this.routersStore,
              disabledFunc: this.routersDisableFunc,
              isMulti: false,
              ...getRouterSelectTablePropsBackend(this),
            },
          ]
        );
        break;
      case 'port':
        ret.push(...getPortFormItem.call(this, false));
        break;
      default:
        break;
    }
    return ret;
  }
}

export default inject('rootStore')(observer(Associate));
