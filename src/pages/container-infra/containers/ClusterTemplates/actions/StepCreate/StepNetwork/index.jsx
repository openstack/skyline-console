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
import Base from 'components/Form';
import { inject, observer } from 'mobx-react';
import { NetworkStore } from 'src/stores/neutron/network';
import { SubnetStore } from 'src/stores/neutron/subnet';
import { getLinkRender } from 'utils/route-map';
import { networkColumns } from 'resources/neutron/network';

export class StepNetwork extends Base {
  async init() {
    this.externalNetworkStore = new NetworkStore();
    this.privateNetworkStore = new NetworkStore();
    this.subnetNetworkStore = new SubnetStore();
    this.getSubnetList();
  }

  get title() {
    return t('Network');
  }

  get name() {
    return t('Network');
  }

  get isStep() {
    return true;
  }

  get isEdit() {
    return !!this.props.extra;
  }

  async getSubnetList() {
    await this.subnetNetworkStore.fetchList();
    this.updateDefaultValue();
  }

  get subnetList() {
    const { fixedNetwork: { selectedRowKeys = [] } = {} } = this.state;
    return (this.subnetNetworkStore.list.data || []).filter(
      (it) => selectedRowKeys[0] === it.network_id
    );
  }

  get networkDrivers() {
    const { context: { coe = '' } = {} } = this.props;
    let acceptedDrivers = [];
    if (coe === 'kubernetes') {
      acceptedDrivers = [
        { value: 'calico', label: 'Calico' },
        { value: 'flannel', label: 'Flannel' },
      ];
    } else if (['swarm', 'swarm-mode'].includes(coe)) {
      acceptedDrivers = [
        { value: 'docker', label: 'Docker' },
        { value: 'flannel', label: 'Flannel' },
      ];
    } else if (['mesos', 'dcos'].includes(coe)) {
      acceptedDrivers = [{ value: 'docker', label: 'Docker' }];
    }
    return acceptedDrivers;
  }

  get nameForStateUpdate() {
    return ['fixedNetwork'];
  }

  get defaultValue() {
    let values = {};

    if (this.isEdit) {
      const {
        extra: {
          network_driver,
          http_proxy,
          https_proxy,
          no_proxy,
          external_network_id,
          fixed_network,
          fixed_subnet,
          dns_nameserver,
          master_lb_enabled,
          floating_ip_enabled,
        } = {},
      } = this.props;
      values = {
        network_driver,
        http_proxy,
        https_proxy,
        no_proxy,
        externalNetwork: {
          selectedRowKeys: [external_network_id],
        },
        fixed_network,
        fixed_subnet,
        dns_nameserver,
        master_lb_enabled,
        floating_ip_enabled,
      };
      if (fixed_network) {
        values.fixedNetwork = {
          selectedRowKeys: [fixed_network],
        };
      }
      if (fixed_subnet) {
        const { subnetInitValue } = this.state;

        if (subnetInitValue) {
          values.fixedSubnet = subnetInitValue;
        } else {
          values.fixedSubnet = {
            selectedRowKeys: [fixed_subnet],
          };
        }
      }
    }

    return values;
  }

  get formItems() {
    const { extra: { network_driver } = {} } = this.props;
    const { subnetInitValue } = this.state;

    return [
      {
        name: 'network_driver',
        label: t('Network Driver'),
        placeholder: t('Choose a Network Driver'),
        type: 'select',
        options: this.networkDrivers,
        disabled: network_driver && this.isEdit,
      },
      {
        name: 'http_proxy',
        label: t('HTTP Proxy'),
        placeholder: t('The http_proxy address to use for nodes in cluster'),
        type: 'input',
      },
      {
        name: 'https_proxy',
        label: t('HTTPS Proxy'),
        placeholder: t('The https_proxy address to use for nodes in cluster'),
        type: 'input',
      },
      {
        name: 'no_proxy',
        label: t('No Proxy'),
        placeholder: t('The no_proxy address to use for nodes in cluster'),
        type: 'input',
      },
      {
        name: 'externalNetwork',
        label: t('External Network'),
        type: 'select-table',
        backendPageStore: this.externalNetworkStore,
        extraParams: {
          'router:external': true,
          project_id: this.currentProjectId,
        },
        required: true,
        loading: this.externalNetworkStore.list.isLoading,
        filterParams: [
          {
            label: t('Name'),
            name: 'name',
          },
        ],
        columns: networkColumns(this),
      },
      {
        name: 'fixedNetwork',
        label: t('Fixed Network'),
        type: 'select-table',
        backendPageStore: this.privateNetworkStore,
        extraParams: {
          'router:external': false,
          project_id: this.currentProjectId,
        },
        loading: this.privateNetworkStore.list.isLoading,
        header: (
          <div>
            {t(' You can go to the console to ')}
            {getLinkRender({
              key: 'network',
              value: `${t('create a new network/subnet')} > `,
            })}
          </div>
        ),
        filterParams: [
          {
            label: t('Name'),
            name: 'name',
          },
        ],
        columns: networkColumns(this),
        onChange: (value) => {
          this.setState(
            {
              fixedNetwork: value,
              subnetInitValue: {
                selectedRowKeys: [],
                selectedRows: [],
              },
            },
            () => {
              this.formRef.current.resetFields(['fixedSubnet']);
            }
          );
        },
      },
      {
        name: 'fixedSubnet',
        label: t('Fixed Subnet'),
        type: 'select-table',
        data: this.subnetList,
        initValue: subnetInitValue,
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
            title: t('CIDR'),
            dataIndex: 'cidr',
          },
          {
            title: t('Gateway IP'),
            dataIndex: 'gateway_ip',
          },
          {
            title: t('IP Version'),
            dataIndex: 'ip_version',
          },
          {
            title: t('Created At'),
            dataIndex: 'created_at',
            valueRender: 'toLocalTime',
          },
        ],
      },
      {
        name: 'dns_nameserver',
        label: t('DNS'),
        placeholder: t('The DNS nameserver to use for this cluster template'),
        type: 'input',
      },
      {
        name: 'master_lb_enabled',
        label: t('Master LB'),
        type: 'check',
      },
      {
        name: 'floating_ip_enabled',
        label: t('Floating IP'),
        type: 'check',
      },
    ];
  }
}

export default inject('rootStore')(observer(StepNetwork));
