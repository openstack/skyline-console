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

import Base from 'components/Form';
import { inject, observer } from 'mobx-react';
import globalNetworkStore from 'src/stores/neutron/network';
import globalSubnetStore from 'src/stores/neutron/subnet';

export class StepNetwork extends Base {
  async init() {
    this.getNetworkList();
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

  async getNetworkList() {
    await globalNetworkStore.fetchList();
  }

  get externalNetworks() {
    return (globalNetworkStore.list.data || [])
      .filter(
        (it) =>
          it['router:external'] === true &&
          it.project_id === this.currentProjectId
      )
      .map((it) => ({
        value: it.id,
        label: it.name,
      }));
  }

  get privateNetworks() {
    return (globalNetworkStore.list.data || [])
      .filter(
        (it) =>
          it['router:external'] === false &&
          it.project_id === this.currentProjectId
      )
      .map((it) => ({
        value: it.id,
        label: it.name,
      }));
  }

  async getSubnetList() {
    await globalSubnetStore.fetchList();
  }

  get subnetList() {
    const { fixed_network } = this.state;
    return (globalSubnetStore.list.data || [])
      .filter((it) => fixed_network === it.network_id)
      .map((it) => ({
        value: it.id,
        label: it.name,
      }));
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
    return ['fixed_network'];
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
        external_network_id,
        fixed_network,
        fixed_subnet,
        dns_nameserver,
        master_lb_enabled,
        floating_ip_enabled,
      };
    }
    return values;
  }

  get formItems() {
    const { extra: { network_driver } = {} } = this.props;
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
        name: 'external_network_id',
        label: t('External Network'),
        placeholder: t('Choose a External Network'),
        type: 'select',
        options: this.externalNetworks,
        disabled: this.isEdit,
        required: true,
      },
      {
        name: 'fixed_network',
        label: t('Fixed Network'),
        placeholder: t('Choose a Private Network'),
        type: 'select',
        options: this.privateNetworks,
        onChange: () => {
          this.updateFormValue('fixed_subnet', null);
        },
      },
      {
        name: 'fixed_subnet',
        label: t('Fixed Subnet'),
        placeholder: t('Choose a Private Network at first'),
        type: 'select',
        options: this.subnetList,
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
