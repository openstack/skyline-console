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
import globalNetworkStore from 'stores/neutron/network';
import { isEmpty } from 'lodash';
import { checkPolicyRule } from 'resources/policy';
import globalProjectStore from 'stores/keystone/project';
import globalRootStore from 'stores/root';
import networkUtil from './networkUtil';

const {
  validateAllocationPoolsWithGatewayIp,
  checkDNS,
  checkIpv6DNS,
  checkHostRoutes,
  checkIpv6HostRoutes,
  getAllocationPools,
  getHostRouters,
} = networkUtil;

const { isIpCidr, isIPv6Cidr, isIpv6 } = ipValidate;

@inject('rootStore')
@observer
export default class CreateSubnet extends ModalAction {
  static id = 'create-subnet';

  static title = t('Create Subnet');

  get name() {
    return t('Create Subnet');
  }

  get network() {
    return this.props.containerProps.detail || this.item || {};
  }

  get instanceName() {
    return this.item.name || this.values.subnet_name;
  }

  get defaultValue() {
    return {
      enable_dhcp: true,
      ip_version: 'ipv4',
      project_id: this.currentProjectId,
      disable_gateway: false,
      more: false,
    };
  }

  init() {
    this.projectStore = globalProjectStore;
    this.isSystemAdmin && this.getProjects();
  }

  getProjects() {
    this.projectStore.fetchList();
  }

  checkCidr = (value) => {
    const { ip_version = 'ipv4' } = this.state;

    if (ip_version === 'ipv4' && !isIpCidr(value)) return false;

    if (ip_version === 'ipv6' && !isIPv6Cidr(value)) return false;

    return true;
  };

  checkGateway = (value) => {
    if (isEmpty(value)) return true;

    if (!isIpv6(value)) return false;

    return true;
  };

  onSubmit = (values) => {
    const { allocation_pools, host_routes, ...rest } = values;

    const allocationPools = getAllocationPools(allocation_pools);

    const hostRouters = getHostRouters(host_routes);

    return globalNetworkStore.createSubnet({
      ...rest,
      network_id: this.network.id,
      allocation_pools: allocationPools,
      host_routes: hostRouters,
    });
  };

  static policy = 'create_subnet';

  static allowed = (item) => {
    const rootStore = globalRootStore;
    if (
      !checkPolicyRule('skyline:system_admin') &&
      item.project_id !== rootStore.user.project.id
    ) {
      return Promise.resolve(false);
    }
    return Promise.resolve(true);
  };

  get isSystemAdmin() {
    return checkPolicyRule('skyline:system_admin');
  }

  validateAllocationPools = (rule, value) => {
    return validateAllocationPoolsWithGatewayIp.call(this, rule, value);
  };

  get formItems() {
    const { more, ip_version = 'ipv4', disable_gateway = false } = this.state;
    const isIpv4 = ip_version === 'ipv4';
    const projectOptions = globalProjectStore.list.data.map((project) => ({
      label: project.name,
      value: project.id,
    }));

    return [
      {
        name: 'subnet_name',
        label: t('Subnet Name'),
        type: 'input-name',
        required: true,
        withoutChinese: true,
      },
      {
        name: 'project_id',
        label: t('Project'),
        type: 'select',
        required: true,
        hidden: !this.isSystemAdmin,
        showSearch: true,
        extra:
          this.currentProjectId !== this.item.project_id &&
          t(
            'You are trying to edit a network that not belong to current project. Please do not continue unless you are quit sure what you are doing.'
          ),
        options: projectOptions,
      },
      {
        name: 'ip_version',
        label: t('IP Version'),
        type: 'select',
        options: [
          {
            label: 'ipv4',
            value: 'ipv4',
          },
          {
            label: 'ipv6',
            value: 'ipv6',
          },
        ],
        onChange: (e) => {
          this.setState({
            ip_version: e,
          });
        },
        required: true,
      },
      {
        name: 'ipv6_ra_mode',
        label: t('Router Advertisements Mode'),
        type: 'select',
        options: [
          {
            label: 'dhcpv6-stateful',
            value: 'dhcpv6-stateful',
          },
          {
            label: 'dhcpv6-stateless',
            value: 'dhcpv6-stateless',
          },
          {
            label: 'slaac',
            value: 'slaac',
          },
        ],
        hidden: ip_version !== 'ipv6',
        dependencies: ['ipv6_address_mode'],
        allowClear: true,
        validator: (rule, value) => {
          const ipv6_address_mode =
            (this.formRef.current &&
              this.formRef.current.getFieldValue('ipv6_address_mode')) ||
            undefined;
          // https://docs.openstack.org/neutron/xena/admin/config-ipv6.html
          if (!value && ipv6_address_mode) {
            return Promise.resolve();
          }
          if (ipv6_address_mode && ipv6_address_mode !== value) {
            return Promise.reject(new Error(t('Invalid combination')));
          }
          return Promise.resolve();
        },
      },
      {
        name: 'ipv6_address_mode',
        label: t('IP Distribution Mode'),
        type: 'select',
        options: [
          {
            label: 'dhcpv6-stateful',
            value: 'dhcpv6-stateful',
          },
          {
            label: 'dhcpv6-stateless',
            value: 'dhcpv6-stateless',
          },
          {
            label: 'slaac',
            value: 'slaac',
          },
        ],
        hidden: ip_version !== 'ipv6',
        allowClear: true,
      },
      {
        name: 'cidr',
        label: t('CIDR'),
        type: 'input',
        placeholder: isIpv4 ? '192.168.0.0/24' : '1001:1001::/64',
        required: true,
        // validator: (rule, value) => (isIpWithMask(value) ? Promise.resolve(true) : Promise.reject(new Error(t('Invalid CIDR.')))),
        validator: (rule, value) => {
          if (!isEmpty(value) && !this.checkCidr(value)) {
            return Promise.reject(new Error(t('Invalid: ') + t('CIDR')));
          }
          return Promise.resolve();
        },
        tip: isIpv4
          ? t(
              'It is recommended that you use the private network address 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16'
            )
          : t('e.g. 2001:Db8::/48'),
      },
      {
        name: 'disable_gateway',
        label: t('Disable Gateway'),
        type: 'check',
        onChange: (e) => {
          this.setState({
            disable_gateway: e,
          });
        },
        hidden: !more,
      },
      {
        name: 'gateway_ip',
        label: t('Gateway IP'),
        type: ip_version === 'ipv6' ? 'input' : 'ip-input',
        onChange: (e) => {
          this.setState({
            gateway_ip: e.target.value,
          });
        },
        tip: t(
          'If no gateway is specified, the first IP address will be defaulted.'
        ),
        hidden: !(more && !disable_gateway),
        validator:
          ip_version === 'ipv6'
            ? (rule, value) => {
                if (!this.checkGateway(value)) {
                  return Promise.reject(
                    new Error(t('Invalid: Please input a valid ipv6.'))
                  );
                }
                return Promise.resolve();
              }
            : null,
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
        extra: t('IP address allocation polls, one enter per line(e.g. {ip})', {
          ip: isIpv4 ? '192.168.1.2,192.168.1.200' : '1001:1001::,1001:1002::',
        }),
        hidden: !more,
        validator: this.validateAllocationPools,
      },
      {
        name: 'dns',
        label: t('DNS'),
        type: 'textarea',
        extra: t('One entry per line(e.g. {ip})', {
          ip: isIpv4 ? '114.114.114.114' : '1001:1001::',
        }),
        hidden: !more,
        validator: isIpv4 ? checkDNS : checkIpv6DNS,
      },
      {
        name: 'host_routes',
        label: t('Host Routes'),
        type: 'textarea',
        extra: t(
          'Additional routes announced to the instance, one entry per line(e.g. {ip})',
          {
            ip: isIpv4
              ? '192.168.200.0/24,10.56.1.254'
              : '1001:1001::/64,1001:1001',
          }
        ),
        hidden: !more,
        validator: isIpv4 ? checkHostRoutes : checkIpv6HostRoutes,
      },
      {
        name: 'more',
        label: t('Advanced Options'),
        type: 'more',
      },
    ];
  }
}
