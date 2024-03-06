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
import globalProjectStore from 'stores/keystone/project';
import globalRootStore from 'stores/root';
import { subnetIpv6Tip } from 'resources/neutron/network';
import { projectTableOptions } from 'resources/keystone/project';
import { toJS } from 'mobx';
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

export class CreateSubnet extends ModalAction {
  static id = 'create-subnet';

  static title = t('Create Subnet');

  get name() {
    return t('Create Subnet');
  }

  static get modalSize() {
    return globalRootStore.hasAdminRole ? 'large' : 'small';
  }

  getModalSize() {
    return this.isSystemAdmin ? 'large' : 'small';
  }

  get network() {
    return this.props.containerProps.detail || this.item || {};
  }

  get instanceName() {
    return this.item.name || this.values.subnet_name;
  }

  get defaultValue() {
    const values = {
      enable_dhcp: true,
      ip_version: 'ipv4',
      disable_gateway: false,
      more: false,
      ipv6_ra_mode: 'slaac',
      ipv6_address_mode: 'slaac',
    };
    if (this.isSystemAdmin) {
      values.project_id = {
        selectedRowKeys: [this.currentProjectId],
      };
    }
    return values;
  }

  init() {
    this.state.projectId = this.currentProjectId;
    this.state.quota = {};
    this.state.quotaLoading = true;
    this.projectStore = globalProjectStore;
    this.isSystemAdmin && this.getProjects();
    this.getQuota();
  }

  async getProjects() {
    await this.projectStore.fetchProjectsWithDomain();
    this.updateDefaultValue();
  }

  get projects() {
    return toJS(this.projectStore.list.data) || [];
  }

  static get disableSubmit() {
    const {
      neutronQuota: { subnet: { left = 0 } = {} },
    } = globalProjectStore;
    return left === 0;
  }

  static get showQuota() {
    return true;
  }

  get showQuota() {
    return true;
  }

  async getQuota() {
    const { projectId } = this.state;
    this.setState({
      quotaLoading: true,
    });
    const result = await this.projectStore.fetchProjectNeutronQuota(projectId);
    const { subnet: quota = {} } = result || {};
    this.setState({
      quota,
      quotaLoading: false,
    });
  }

  get quotaInfo() {
    const { quota = {}, quotaLoading } = this.state;
    if (quotaLoading) {
      return [];
    }
    const { left = 0 } = quota;
    const add = left === 0 ? 0 : 1;
    const data = {
      ...quota,
      add,
      name: 'subnet',
      title: t('Subnet'),
    };
    return [data];
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
    const { allocation_pools, host_routes, project_id, ...rest } = values;

    const allocationPools = getAllocationPools(allocation_pools);

    const hostRouters = getHostRouters(host_routes);

    return globalNetworkStore.createSubnet({
      ...rest,
      project_id: project_id
        ? project_id.selectedRowKeys[0]
        : this.currentProjectId,
      network_id: this.network.id,
      allocation_pools: allocationPools,
      host_routes: hostRouters,
    });
  };

  static policy = 'create_subnet';

  static allowed = (item, containerProps) => {
    const { project_id } = item || {};
    const { detail: { project_id: detailProjectId } = {} } =
      containerProps || {};
    const networkProjectId = project_id || detailProjectId;
    const rootStore = globalRootStore;
    const {
      hasAdminRole = false,
      user: { project: { id: userProjectId } = {} } = {},
    } = rootStore;
    if (!hasAdminRole && networkProjectId !== userProjectId) {
      return Promise.resolve(false);
    }
    return Promise.resolve(true);
  };

  get isSystemAdmin() {
    return this.props.rootStore.hasAdminRole;
  }

  validateAllocationPools = (rule, value) => {
    return validateAllocationPoolsWithGatewayIp.call(this, rule, value);
  };

  onProjectChange = (value) => {
    const { selectedRowKeys } = value;
    this.setState(
      {
        projectId: selectedRowKeys[0],
      },
      () => {
        this.getQuota();
      }
    );
  };

  get networkProjectId() {
    const { project_id } = this.item;
    if (project_id) {
      return project_id;
    }
    const { detail = {} } = this.containerProps;
    return detail.project_id;
  }

  get formItems() {
    const {
      more,
      ip_version = 'ipv4',
      disable_gateway = false,
      projectId,
    } = this.state;
    const isIpv4 = ip_version === 'ipv4';

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
        type: 'select-table',
        required: true,
        hidden: !this.isSystemAdmin,
        extra:
          projectId !== this.networkProjectId &&
          t(
            'The selected project is different from the project to which the network belongs. That is, the subnet to be created is not under the same project as the network. Please do not continue unless you are quite sure what you are doing.'
          ),
        isLoading: this.projectStore.list.isLoading,
        data: this.projects,
        onChange: this.onProjectChange,
        ...projectTableOptions,
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
        tip: subnetIpv6Tip,
        hidden: ip_version !== 'ipv6',
        dependencies: ['ipv6_address_mode'],
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
        tip: subnetIpv6Tip,
        hidden: ip_version !== 'ipv6',
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

export default inject('rootStore')(observer(CreateSubnet));
