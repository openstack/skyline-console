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
import { PortStore } from 'stores/neutron/port-extension';
import { get } from 'lodash';

export class MemberStep extends Base {
  init() {
    this.store = new PortStore();
    this.state = {
      ports: [],
    };
    this.store.fetchList({ withInstanceName: true }).then((ports) => {
      this.setState({
        ports: ports.filter(
          (port) =>
            port.device_owner !== 'network:dhcp' &&
            port.device_owner !== 'network:router_gateway'
        ),
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
    const subnet_id = get(this.props.context, 'vip_address[0].subnet', '');
    return [
      {
        name: 'extMembers',
        type: 'member-allocator',
        lbSubnetId: subnet_id,
        isLoading: this.store.list.isLoading,
        ports: this.state.ports,
      },
    ];
  }
}

export default inject('rootStore')(observer(MemberStep));
