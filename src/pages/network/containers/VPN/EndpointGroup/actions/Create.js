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
import { ipValidate } from 'utils/validate';
import { RouterStore } from 'stores/neutron/router';
import { SubnetStore } from 'stores/neutron/subnet';
import globalVPNEndPointGroupStore from 'stores/neutron/vpn-endpoint-group';
import { getRouterSelectTablePropsBackend } from 'resources/neutron/router';
import {
  getPortsWithFixedIPs,
  getSubnetToRouter,
} from 'resources/neutron/floatingip';

const { isCidr, isIPv6CidrOnly } = ipValidate;

export class Create extends ModalAction {
  static id = 'create-vpn-endpoint-group';

  static title = t('Create VPN Endpoint Group');

  static buttonText = t('Create');

  static policy = 'create_endpoint_group';

  static aliasPolicy = 'neutron:create_endpoint_group';

  static allowed = () => Promise.resolve(true);

  get name() {
    return t('create vpn endpoint group');
  }

  static get modalSize() {
    return 'large';
  }

  getModalSize() {
    return 'large';
  }

  init() {
    this.routerStore = new RouterStore();
    this.subnetStore = new SubnetStore();
    this.state = {
      subnets: [],
      type: 'subnet',
      subnetLoading: true,
    };
    this.getAllSubnets();
  }

  async getAllSubnets() {
    this.allSubnets = await this.subnetStore.pureFetchList();
    this.setState({
      subnetLoading: false,
    });
  }

  get defaultValue() {
    return {
      type: 'subnet',
    };
  }

  onSubmit = (values) => {
    const { type } = this.state;
    const { name, description, ...rest } = values;
    const data = {
      name,
      description,
      type,
    };
    if (type === 'subnet') {
      const { subnet_id } = rest;
      data.endpoints = subnet_id.selectedRowKeys;
    } else if (type === 'cidr') {
      const { endpoints } = rest;
      data.endpoints = endpoints.split('\n');
    }
    return globalVPNEndPointGroupStore.create(data);
  };

  handleRouterChange = async (value) => {
    this.setState({
      subnetLoading: true,
    });
    const ports = await getPortsWithFixedIPs();
    const allSubnets = getSubnetToRouter(ports, value.selectedRows, false);
    this.setState({
      subnets: this.allSubnets.filter((item) => {
        return allSubnets.findIndex((i) => i.subnet_id === item.id) > -1;
      }),
      subnetLoading: false,
    });
    this.formRef.current.resetFields(['subnet_id']);
  };

  get formItems() {
    const { subnets, type, subnetLoading } = this.state;
    const isLocal = type === 'subnet';

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
      {
        name: 'type',
        label: t('Type'),
        type: 'select',
        required: true,
        options: [
          {
            label: t('Peer'),
            value: 'cidr',
          },
          {
            label: t('Local'),
            value: 'subnet',
          },
        ],
        onChange: (e) => {
          this.setState({
            type: e,
          });
        },
      },
      {
        name: 'router_id',
        label: t('Router'),
        type: 'select-table',
        backendPageStore: this.routerStore,
        extraParams: { project_id: this.currentProjectId },
        ...getRouterSelectTablePropsBackend(this),
        required: true,
        onChange: this.handleRouterChange,
        hidden: !isLocal,
      },
      {
        name: 'subnet_id',
        label: t('Subnet'),
        type: 'select-table',
        data: subnets,
        isLoading: subnetLoading,
        isMulti: true,
        columns: [
          {
            title: t('Name'),
            dataIndex: 'name',
            // todo: what?
            isLink: true,
          },
          {
            title: t('CIDR'),
            dataIndex: 'cidr',
          },
        ],
        required: true,
        hidden: !isLocal,
      },
      {
        name: 'endpoints',
        label: t('Peer Network Segment'),
        type: 'textarea',
        validator: (rule, value) => {
          const flag = value
            .split('\n')
            .some((i) => !isCidr(i) && !isIPv6CidrOnly(i));
          if (!flag) {
            return Promise.resolve(true);
          }
          return Promise.reject(
            new Error(t('Invalid: CIDR Format Error(e.g. 10.10.10.0/24)'))
          );
        },
        extra: t(
          'Please fill in the peer network segment and subnet mask of CIDR format, the written subnets should be under the same router, one per line.'
        ),
        hidden: isLocal,
        required: true,
      },
    ];
  }
}

export default inject('rootStore')(observer(Create));
