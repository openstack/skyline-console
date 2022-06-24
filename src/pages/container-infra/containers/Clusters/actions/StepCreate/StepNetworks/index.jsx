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
      newNetwork: true,
    };
  }

  get nameForStateUpdate() {
    return ['newNetwork'];
  }

  get formItems() {
    const { newNetwork } = this.state;

    return [
      {
        name: 'master_lb_enabled',
        label: t('Enable Load Balancer'),
        type: 'check',
        content: t('Enabled Load Balancer for Master Nodes'),
      },
      {
        name: 'newNetwork',
        label: t('Enabled Network'),
        type: 'check',
        content: t('Create New Network'),
      },
      {
        name: 'fixed_network',
        label: t('Use an Existing Network'),
        type: 'network-select-table',
        hidden: newNetwork,
      },
      {
        type: 'divider',
      },
      {
        name: 'floating_ip_enabled',
        label: t('Enable Floating IP'),
        type: 'check',
        tip: t(
          'Whether enable or not using the floating IP of cloud provider. If it’s not set, the value of this in template will be used.'
        ),
      },
    ];
  }
}

export default inject('rootStore')(observer(StepNetworks));
