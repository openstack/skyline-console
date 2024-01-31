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
import { SecurityGroupStore } from 'stores/neutron/security-group';
import { PortStore } from 'stores/neutron/port-extension';
import Base from 'components/Form';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { portColumns, portFilters } from 'src/resources/neutron/port';
import {
  securityGroupColumns,
  securityGroupFilter,
} from 'src/resources/neutron/security-group';
import { getLinkRender } from 'utils/route-map';

export class StepNetworks extends Base {
  init() {
    this.portStore = new PortStore();
    this.securityGroupStore = new SecurityGroupStore();
    this.getPorts();
  }

  get title() {
    return t('Networks');
  }

  get name() {
    return t('Networks');
  }

  getPorts() {
    this.portStore.fetchList({
      project_id: this.currentProjectId,
      status: 'DOWN',
    });
  }

  get ports() {
    return (toJS(this.portStore.list.data) || []).filter((it) => !it.device_id);
  }

  get formItems() {
    const { networks = [] } = this.state;
    const {
      context: { exposedPorts = [] },
    } = this.props;

    return [
      {
        name: 'networks',
        label: t('Networks'),
        type: 'network-select-table',
        isMulti: true,
        onChange: ({ selectedRowKeys = [] }) => {
          this.setState({
            networks: selectedRowKeys,
          });
        },
      },
      {
        name: 'ports',
        type: 'select-table',
        label: t('Ports'),
        data: this.ports,
        isLoading: this.portStore.list.isLoading,
        isMulti: true,
        header: t(
          'Ports provide extra communication channels to your containers. You can select ports instead of networks or a mix of both, If the terminal port and the network are selected at the same time, note that the terminal port is not a terminal port of the selected network, and the container under the same network will only be assigned one IP address (The port executes its own security group rules by default).'
        ),
        filterParams: portFilters,
        columns: portColumns,
      },
      {
        name: 'securityGroup',
        label: t('Security Group'),
        type: 'select-table',
        backendPageStore: this.securityGroupStore,
        extraParams: { project_id: this.currentProjectId },
        isMulti: true,
        hidden: exposedPorts.length || !networks.length,
        header: (
          <div style={{ marginBottom: 8 }}>
            {t(
              'The security group is similar to the firewall function and is used to set up network access control. '
            )}
            {t(' You can go to the console to ')}
            {getLinkRender({
              key: 'securityGroup',
              value: `${t('create a new security group')}> `,
              extra: { target: '_blank' },
            })}
          </div>
        ),
        filterParams: securityGroupFilter,
        columns: securityGroupColumns,
        tip: t('If exposed port is specified, this parameter will be ignored.'),
      },
    ];
  }
}

export default inject('rootStore')(observer(StepNetworks));
