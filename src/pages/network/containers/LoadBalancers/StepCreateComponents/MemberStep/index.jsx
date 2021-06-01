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
import Base from 'components/Form';
import { PortStore } from 'stores/neutron/port';
import { VirtualAdapterStore } from 'stores/neutron/virtual-adapter';

@inject('rootStore')
@observer
export default class MemberStep extends Base {
  init() {
    this.store = new VirtualAdapterStore();
    this.portStore = new PortStore();
    this.state = {
      ports: [],
    };
    const network_id = this.props.context.vip_network_id.selectedRowKeys[0];
    const subnet_id = this.props.context.vip_address[0].subnet;
    this.store.fetchList({ network_id }).then((ports) => {
      this.setState({
        ports: ports
          .filter(
            (port) =>
              port.fixed_ips.some(
                (fixed_ip) => fixed_ip.subnet_id === subnet_id
              ) &&
              port.device_owner !== 'network:dhcp' &&
              port.device_owner !== 'network:router_gateway'
          )
          .map((item) => {
            item.fixed_ips = item.fixed_ips.filter(
              (fixed_ip) => fixed_ip.subnet_id === subnet_id
            );
            return item;
          }),
      });
    });
  }

  get title() {
    return 'Member Detail';
  }

  get name() {
    return 'Member Detail';
  }

  get isStep() {
    return true;
  }

  allowed = () => Promise.resolve();

  get wrapperCol() {
    return {
      xs: { span: 16 },
      sm: { span: 12 },
    };
  }

  get formItems() {
    return [
      {
        name: 'extMembers',
        type: 'member-allocator',
        isLoading: this.store.list.isLoading,
        ports: this.state.ports,
      },
    ];
  }
}
