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
import globalSubnetStore from 'stores/neutron/subnet';
import globalRootStore from 'stores/root';
import networkUtil from '../../Network/actions/networkUtil';

const {
  checkAllocation_pools,
  checkIpv6Allocation_pools,
  checkDNS,
  checkIpv6DNS,
  checkHostRoutes,
  checkIpv6HostRoutes,
  getAllocationPools,
  getHostRouters,
  getAllocationPoolsIntoLines,
  getDNSIntoLines,
  getHostRoutesIntoLines,
  splitToArray,
} = networkUtil;

const { isIpWithMask, isIPv6Cidr } = ipValidate;

export class EditSubnet extends ModalAction {
  static id = 'edit-subnet';

  static title = t('Edit Subnet');

  get name() {
    return t('Edit Subnet');
  }

  static buttonText = t('Edit');

  get subnet() {
    return this.props.item;
  }

  get defaultValue() {
    return {
      ...this.subnet,
      subnet_name: this.subnet.name,
      allocation_pools: getAllocationPoolsIntoLines(
        this.subnet.allocation_pools
      ),
      host_routes: getHostRoutesIntoLines(this.subnet.host_routes),
      dns: getDNSIntoLines(this.subnet.dns_nameservers),
      disable_gateway: !this.subnet.gateway_ip,
      gateway_ip: this.subnet.gateway_ip,
      more: false,
    };
  }

  onSubmit = (values) => {
    const {
      gateway_ip,
      allocation_pools,
      host_routes,
      dns,
      disable_gateway,
      ...rest
    } = values;

    const allocationPools = getAllocationPools(allocation_pools);

    const hostRouters = getHostRouters(host_routes);

    const dns_nameservers = splitToArray(dns);

    const data = {
      ...rest,
      network_id: this.subnet.network_id,
      allocation_pools: allocationPools,
      host_routes: hostRouters,
      dns_nameservers,
    };

    if (disable_gateway) {
      data.gateway_ip = null;
    } else if (gateway_ip && gateway_ip !== this.item.gateway_ip) {
      data.gateway_ip = gateway_ip;
    }

    return globalSubnetStore.update(this.subnet, data);
  };

  static policy = 'update_subnet';

  static allowed = (item, containerProps) => {
    const { isAdminPage = false } = containerProps || {};
    const { tenant_id } = item;
    const result = isAdminPage || tenant_id === globalRootStore.projectId;
    return Promise.resolve(result);
  };

  get formItems() {
    const { more, disable_gateway = !this.item.gateway_ip } = this.state;

    return [
      {
        name: 'subnet_name',
        label: t('Subnet Name'),
        type: 'input-name',
        required: true,
      },
      {
        name: 'cidr',
        label: t('CIDR'),
        type: 'input',
        placeholder: '192.168.0.0/24',
        disabled: true,
        required: true,
        validator: (rule, value) =>
          (
            this.subnet.ip_version === 4
              ? isIpWithMask(value)
              : isIPv6Cidr(value)
          )
            ? Promise.resolve(true)
            : Promise.reject(new Error(t('Invalid CIDR.'))),
        tip: t(
          'It is recommended that you use the private network address 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16'
        ),
      },
      {
        name: 'disable_gateway',
        label: t('Disable Gateway'),
        type: 'check',
        onChange: (e) => {
          this.setState(
            {
              disable_gateway: e,
            },
            () => {
              this.formRef.current.validateFields(['gateway_ip']);
            }
          );
        },
        hidden: !more,
      },
      {
        name: 'gateway_ip',
        label: t('Gateway IP'),
        type: 'ip-input',
        version: this.subnet.ip_version,
        required: !disable_gateway,
        tip: t(
          'If no gateway is specified, the first IP address will be defaulted.'
        ),
        hidden: !(more && !disable_gateway),
      },
      {
        name: 'enable_dhcp',
        label: t('DHCP'),
        type: 'radio',
        optionType: 'default',
        options: [
          {
            label: t('Enabled'),
            value: true,
          },
          {
            label: t('Disabled'),
            value: false,
          },
        ],
        hidden: !more,
      },
      {
        name: 'allocation_pools',
        label: t('Allocation Pools'),
        type: 'textarea',
        extra: t(
          'IP address allocation polls, one enter per line(e.g. 192.168.1.2,192.168.1.200)'
        ),
        hidden: !more,
        validator:
          this.subnet.ip_version === 4
            ? checkAllocation_pools
            : checkIpv6Allocation_pools,
      },
      {
        name: 'dns',
        label: t('DNS'),
        type: 'textarea',
        extra: t('One entry per line(e.g. 114.114.114.114)'),
        hidden: !more,
        validator: this.subnet.ip_version === 4 ? checkDNS : checkIpv6DNS,
      },
      {
        name: 'host_routes',
        label: t('Host Routes'),
        type: 'textarea',
        extra: t(
          'Additional routes announced to the instance, one entry per line(e.g. 192.168.200.0/24,10.56.1.254)'
        ),
        hidden: !more,
        validator:
          this.subnet.ip_version === 4 ? checkHostRoutes : checkIpv6HostRoutes,
      },
      {
        name: 'more',
        label: t('Advanced Options'),
        type: 'more',
      },
    ];
  }
}

export default inject('rootStore')(observer(EditSubnet));
