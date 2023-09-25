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
import { nameTypeValidate, ipValidate } from 'utils/validate';
import globalNetworkStore from 'stores/neutron/network';
import globalProjectStore from 'stores/keystone/project';
import { isEmpty, isFunction } from 'lodash';
import Notify from 'components/Notify';
import { checkSystemAdmin } from 'resources/skyline/policy';
import globalNeutronStore from 'stores/neutron/neutron';
import { subnetIpv6Tip } from 'resources/neutron/network';
import { projectTableOptions } from 'resources/keystone/project';
import { isAdminPage } from 'utils';
import { toJS } from 'mobx';
import networkUtil from './networkUtil';

const {
  physicalNetworkArray,
  segmentationNetworkArray,
  segmentationNetworkRequireArray,
  validateAllocationPoolsWithGatewayIp,
  checkDNS,
  checkIpv6DNS,
  checkHostRoutes,
  checkIpv6HostRoutes,
  getAllocationPools,
  getHostRouters,
} = networkUtil;

const { isIpCidr, isIPv6Cidr, isIpv6 } = ipValidate;

const { nameValidateWithoutChinese } = nameTypeValidate;

const getAdd = (networkQuota, subnetQuota, createSubnet = false) => {
  const { left: networkLeft = 0 } = networkQuota || {};
  const { left: subnetLeft = 0 } = subnetQuota || {};
  if (createSubnet) {
    return networkLeft !== 0 && subnetLeft !== 0 ? 1 : 0;
  }
  return networkLeft !== 0 ? 1 : 0;
};

export class CreateNetwork extends ModalAction {
  static id = 'create-network';

  static title = t('Create Network');

  get name() {
    return t('create network');
  }

  static get modalSize() {
    const { pathname } = window.location;
    return isAdminPage(pathname) ? 'large' : 'small';
  }

  getModalSize() {
    return this.isAdminPage ? 'large' : 'small';
  }

  init() {
    globalNetworkStore.updateCreateWithSubnet(false);
    this.state.networkQuota = {};
    this.state.subnetQuota = {};
    this.state.quotaLoading = true;
    this.state.create_subnet = false;
    this.state.projectId = this.currentProjectId;
    this.projectStore = globalProjectStore;
    globalNeutronStore.fetchAvailableZones();
    this.isAdminPage && this.fetchProjectList();
    this.getQuota();
  }

  get isSystemAdmin() {
    return checkSystemAdmin();
  }

  static get disableSubmit() {
    const {
      neutronQuota: { network = {}, subnet = {} },
    } = globalProjectStore;
    const { createWithSubnet = false } = globalNetworkStore;
    const add = getAdd(network, subnet, createWithSubnet);
    return add === 0;
  }

  static get showQuota() {
    return true;
  }

  async fetchProjectList() {
    await this.projectStore.fetchProjectsWithDomain();
    this.updateDefaultValue();
  }

  get projects() {
    return toJS(this.projectStore.list.data) || [];
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
    const { network: networkQuota = {}, subnet: subnetQuota = {} } =
      result || {};
    this.setState({
      networkQuota,
      subnetQuota,
      quotaLoading: false,
    });
  }

  get quotaInfo() {
    const {
      networkQuota = {},
      subnetQuota = {},
      quotaLoading,
      create_subnet,
    } = this.state;
    if (quotaLoading) {
      return [];
    }
    const add = getAdd(networkQuota, subnetQuota, create_subnet);
    const network = {
      ...networkQuota,
      add,
      name: 'network',
      title: t('Network'),
    };
    const subnet = {
      ...subnetQuota,
      add: create_subnet ? add : 0,
      name: 'subnet',
      title: t('Subnet'),
      type: 'line',
    };
    return [network, subnet];
  }

  get defaultValue() {
    const values = {
      enable_dhcp: true,
      provider_network_type: 'vxlan',
      ip_version: 'ipv4',
      disable_gateway: false,
      more: false,
      port_security_enabled: true,
      ipv6_ra_mode: 'slaac',
      ipv6_address_mode: 'slaac',
    };
    if (this.isAdminPage) {
      values.project_id = {
        selectedRowKeys: [this.currentProjectId],
      };
    }
    return values;
  }

  onSubmit = (values) => {
    const {
      // admin_state_up,
      name,
      project_id,
      provider_network_type,
      provider_physical_network,
      provider_segmentation_id,
      shared,
      external_network,
      availableZone,
      allocation_pools,
      host_routes,
      description,
      mtu,
      port_security_enabled,
      ...rest
    } = values;

    const allocationPools = getAllocationPools(allocation_pools);

    const hostRouters = getHostRouters(host_routes);

    const networkCommonData = {
      name,
      description,
      port_security_enabled,
    };

    if (availableZone) {
      networkCommonData.availability_zone_hints = [availableZone];
    }

    if (mtu) {
      networkCommonData.mtu = mtu;
    }

    const networkAdminPageData = {
      'router:external': external_network,
      project_id: project_id
        ? project_id.selectedRowKeys[0]
        : this.currentProjectId,
      'provider:network_type': provider_network_type,
      'provider:physical_network': provider_physical_network,
      'provider:segmentation_id': provider_segmentation_id,
    };
    const networkSystemAdminData = {
      shared,
    };
    let fetchData = { ...networkCommonData };
    if (this.isAdminPage) {
      fetchData = { ...fetchData, ...networkAdminPageData };
    }
    if (this.isSystemAdmin) {
      fetchData = { ...fetchData, ...networkSystemAdminData };
    }
    return globalNetworkStore.createAndMore(fetchData, {
      ...rest,
      allocation_pools: allocationPools,
      host_routes: hostRouters,
    });
  };

  onOk = (values, containerProps, callback) => {
    // eslint-disable-next-line no-console
    console.log('onOk', values);
    this.values = values;
    return this.onSubmit(values, containerProps).then(
      () => {
        !this.isModal && this.routing.push(this.listUrl);
        Notify.success(this.successText);
        if (callback && isFunction(callback)) {
          callback(true, false);
        }
      },
      (err) => {
        const { type, error } = JSON.parse(err);
        if (type === 'create_network') {
          Notify.errorWithDetail(error, this.errorText);
        } else if (type === 'create_subnet') {
          Notify.errorWithDetail(
            error,
            t('Unable to {action}, instance: {name}.', {
              action: t('Create Subnet'),
              name: values.subnet_name,
            })
          );
        }
        // eslint-disable-next-line no-console
        console.log(error);
        if (callback && isFunction(callback)) {
          callback(false, true);
        }
      }
    );
  };

  get availableZones() {
    return (globalNeutronStore.availableZones || [])
      .filter((it) => it.state === 'available' && it.resource === 'network')
      .map((it) => ({
        value: it.name,
        label: it.name,
      }));
  }

  static policy = ['create_network', 'create_subnet'];

  static allowed = () => Promise.resolve(true);

  get SegIDTips() {
    const { provider_network_type = 'vxlan' } = this.state;
    switch (provider_network_type) {
      case 'vxlan':
        return t(
          'For VXLAN networks, valid segmentation IDs are 1 to 16777215'
        );
      case 'vlan':
        return t('For VLAN networks, valid segmentation IDs are 1 to 4094');
      case 'gre':
        return t(
          'For GRE networks, valid segmentation IDs are 1 to 4294967295'
        );
      default:
        return t(
          'For VXLAN networks, valid segmentation IDs are 1 to 16777215'
        );
    }
  }

  get SegMax() {
    const { provider_network_type = 'vxlan' } = this.state;
    switch (provider_network_type) {
      case 'vxlan':
        return 16777215;
      case 'vlan':
        return 4094;
      case 'gre':
        return 4294967295;
      default:
        return 16777215;
    }
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

  onCreateSubnetChange = (value) => {
    this.setState({
      create_subnet: value,
    });
    globalNetworkStore.updateCreateWithSubnet(value);
  };

  get formItems() {
    const {
      more,
      create_subnet = false,
      provider_network_type = 'vxlan',
      ip_version = 'ipv4',
      disable_gateway = false,
    } = this.state;

    const hiddenPhysicalNetwork =
      this.isAdminPage &&
      physicalNetworkArray.indexOf(provider_network_type) > -1;
    const requirePhysicalNetwork =
      this.isAdminPage &&
      physicalNetworkArray.indexOf(provider_network_type) > -1;
    const hiddenSegmentation =
      this.isAdminPage &&
      segmentationNetworkArray.indexOf(provider_network_type) > -1;
    const requireSegmentation =
      this.isAdminPage &&
      segmentationNetworkRequireArray.indexOf(provider_network_type) > -1;
    const isIpv4 = ip_version === 'ipv4';

    return [
      {
        name: 'name',
        label: t('Network Name'),
        type: 'input-name',
        required: true,
        withoutChinese: true,
      },
      {
        name: 'description',
        label: t('Description'),
        type: 'textarea',
        required: false,
      },
      {
        name: 'availableZone',
        label: t('Available Zone'),
        type: 'select',
        placeholder: t('Please select'),
        options: this.availableZones,
      },
      {
        name: 'mtu',
        label: t('MTU'),
        type: 'input-number',
        min: 68,
        max: 9000,
        extra: t('Minimum value is 68 for IPv4, and 1280 for IPv6.'),
      },
      {
        name: 'create_subnet',
        label: t('Create Subnet'),
        type: 'check',
        onChange: this.onCreateSubnetChange,
      },
      {
        name: 'shared',
        label: t('Shared'),
        type: 'check',
        hidden: !this.isSystemAdmin,
      },
      {
        name: 'port_security_enabled',
        label: t('Port Security Enabled'),
        type: 'switch',
        required: true,
      },
      // {
      //   name: 'admin_state_up',
      //   label: t('Enable Admin State'),
      //   type: 'check',
      //   onChange: (e) => {
      //     this.setState({
      //       enable_admin_state: e,
      //     });
      //   },
      //   tip: t('If checked, the network will be enable.'),
      //   hidden: !isAdmin,
      // },
      {
        name: 'external_network',
        label: t('External Network'),
        type: 'check',
        hidden: !this.isAdminPage,
      },
      {
        name: 'project_id',
        label: t('Project'),
        type: 'select-table',
        hidden: !this.isAdminPage,
        required: this.isAdminPage,
        isLoading: this.projectStore.list.isLoading,
        data: this.projects,
        onChange: this.onProjectChange,
        ...projectTableOptions,
      },
      {
        name: 'provider_network_type',
        label: t('Provider Network Type'),
        type: 'select',
        hidden: !this.isAdminPage,
        required: this.isAdminPage,
        options: [
          { label: 'vxlan', value: 'vxlan' },
          { label: 'flat', value: 'flat' },
          { label: 'vlan', value: 'vlan' },
          { label: 'gre', value: 'gre' },
        ],
        onChange: (e) => {
          this.setState({
            provider_network_type: e,
          });
        },
      },
      {
        name: 'provider_physical_network',
        label: t('Provider Physical Network'),
        type: 'input',
        hidden: !hiddenPhysicalNetwork,
        required: requirePhysicalNetwork,
      },
      {
        name: 'provider_segmentation_id',
        label: t('Segmentation ID'),
        type: 'input-int',
        hidden: !hiddenSegmentation,
        required: requireSegmentation,
        min: 1,
        max: this.SegMax,
        extra: this.SegIDTips,
      },
      {
        name: 'subnet_name',
        label: t('Subnet Name'),
        hidden: !create_subnet,
        type: 'input',
        required: create_subnet,
        validator: nameValidateWithoutChinese,
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
        hidden: !create_subnet,
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
        required: create_subnet,
        validator: (rule, value) => {
          if (!create_subnet && !value) {
            return Promise.resolve();
          }
          if (!isEmpty(value) && !this.checkCidr(value)) {
            // eslint-disable-next-line prefer-promise-reject-errors
            return Promise.reject(new Error(t('Invalid: ') + t('CIDR')));
          }
          return Promise.resolve();
        },
        hidden: !create_subnet,
        tip: isIpv4
          ? t(
              'It is recommended that you use the private network address 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16'
            )
          : t('e.g. 2001:Db8::/48'),
      },
      // {
      //   name: 'connect_router',
      //   label: t('Connect router'),
      //   type: 'check',
      //   onChange: (e) => {
      //     this.setState({
      //       connect_router: e,
      //     });
      //   },
      //   hidden: !create_subnet,
      // },
      // {
      //   name: 'routers',
      //   label: t('Routers'),
      //   type: 'select',
      //   hidden: !connect_router,
      //   options: [
      //     { label: 'test1', value: 'test1' },
      //     { label: 'test2', value: 'test2' },
      //     { label: 'test3', value: 'test3' },
      //   ],
      // },
      {
        name: 'disable_gateway',
        label: t('Disable Gateway'),
        type: 'check',
        onChange: (e) => {
          this.setState({
            disable_gateway: e,
          });
        },
        hidden: !(create_subnet && more),
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
        hidden: !(create_subnet && more && !disable_gateway),
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
        hidden: !(create_subnet && more),
      },
      {
        name: 'allocation_pools',
        label: t('Allocation Pools'),
        type: 'textarea',
        extra: t('IP address allocation polls, one enter per line(e.g. {ip})', {
          ip: isIpv4 ? '192.168.1.2,192.168.1.200' : '1001:1001::,1001:1002::',
        }),
        hidden: !(create_subnet && more),
        validator: this.validateAllocationPools,
        dependencies: ['gateway_ip'],
      },
      {
        name: 'dns',
        label: t('DNS'),
        type: 'textarea',
        extra: t('One entry per line(e.g. {ip})', {
          ip: isIpv4 ? '114.114.114.114' : '1001:1001::/64',
        }),
        hidden: !(create_subnet && more),
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
        hidden: !(create_subnet && more),
        validator: isIpv4 ? checkHostRoutes : checkIpv6HostRoutes,
      },
      {
        name: 'more',
        label: t('Advanced Options'),
        type: 'more',
        hidden: !create_subnet,
      },
    ];
  }
}

export default inject('rootStore')(observer(CreateNetwork));
