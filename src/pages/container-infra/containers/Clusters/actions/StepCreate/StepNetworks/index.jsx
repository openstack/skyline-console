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

export class StepNetworks extends Base {
  get title() {
    return t('Cluster Network');
  }

  get name() {
    return t('Cluster Network');
  }

  allowed = () => Promise.resolve();

  get defaultValue() {
    return {
      enableNetwork: true,
    };
  }

  get nameForStateUpdate() {
    return ['enableNetwork'];
  }

  get formItems() {
    const { enableNetwork } = this.state;

    return [
      {
        name: 'enableLoadBalancer',
        label: t('Enable Load Balancer'),
        type: 'check',
        content: t('Enabled Load Balancer for Master Nodes'),
      },
      {
        name: 'enableNetwork',
        label: t('Enabled Network'),
        type: 'check',
        content: t('Create New Network'),
      },
      {
        name: 'network',
        label: t('Use an Existing Network'),
        type: 'network-select-table',
        hidden: enableNetwork,
      },
      {
        type: 'divider',
      },
      {
        name: 'floating_ip_enabled',
        label: t('Cluster API'),
        type: 'select',
        options: [
          {
            label: t('Accessible on private network only'),
            value: 'networkOnly',
          },
          {
            label: t('Accessible on the public internet'),
            value: 'publicInternet',
          },
        ],
      },
      {
        type: 'divider',
      },
      {
        name: 'ingress_controller',
        label: t('Ingress Controller'),
        type: 'select',
        options: [
          {
            label: t('octavia'),
            value: 'octavia',
          },
          {
            label: t('nginx'),
            value: 'nginx',
          },
          {
            label: t('traefik'),
            value: 'traefik',
          },
        ],
        placeholder: t('Choose an ingress controller'),
      },
    ];
  }
}

export default inject('rootStore')(observer(StepNetworks));
