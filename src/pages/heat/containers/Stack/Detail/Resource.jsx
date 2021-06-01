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

import React from 'react';
import { observer, inject } from 'mobx-react';
import Base from 'containers/List';
import { StackResourceStore } from 'stores/heat/resource';
import { stackStatus } from 'resources/stack';
import { Link } from 'react-router-dom';

@inject('rootStore')
@observer
export default class Resource extends Base {
  init() {
    this.store = new StackResourceStore();
  }

  get policy() {
    return 'resource:index';
  }

  get name() {
    return t('stack resources');
  }

  get hideSearch() {
    return true;
  }

  get resourceMap() {
    return [
      {
        key: 'OS::Cinder::EncryptedVolumeType',
        isAdmin: true,
        getUrl: (value) =>
          `${this.getUrl('/storage/volume-type')}/detail/${value}`,
      },
      {
        key: 'OS::Cinder::QoSAssociation',
        isAdmin: true,
        getUrl: (value) =>
          `${this.getUrl('/storage/volume-type')}/qos/detail/${value}`,
      },
      {
        key: 'OS::Cinder::QoSSpecs',
        isAdmin: true,
        getUrl: (value) =>
          `${this.getUrl('/storage/volume-type')}/qos/detail/${value}`,
      },
      {
        key: 'OS::Cinder::Volume',
        getUrl: (value) => `${this.getUrl('/storage/volume')}/detail/${value}`,
      },
      {
        key: 'OS::Cinder::VolumeType',
        isAdmin: true,
        getUrl: (value) =>
          `${this.getUrl('/storage/volume-type')}/detail/${value}`,
      },
      {
        key: 'OS::Glance::WebImage',
        getUrl: (value) => `${this.getUrl('/compute/image')}/detail/${value}`,
      },
      {
        key: 'OS::Glance::WebImage',
        getUrl: (value) => `${this.getUrl('/compute/image')}/detail/${value}`,
      },
      {
        key: 'OS::Heat::Stack',
        getUrl: (value) => `${this.getUrl('/heat/stack')}/detail/${value}`,
      },
      {
        key: 'OS::Ironic::Port',
        getUrl: (value) =>
          `${this.getUrl(
            '/network/virtual_adapter',
            '_admin'
          )}/detail/${value}`,
      },
      {
        key: 'OS::Keystone::Domain',
        isAdmin: true,
        getUrl: (value) => `${this.getUrl('/identity/domain')}/detail/${value}`,
      },
      {
        key: 'OS::Keystone::Group',
        isAdmin: true,
        getUrl: (value) =>
          `${this.getUrl('/identity/user-group')}/detail/${value}`,
      },
      {
        key: 'OS::Keystone::Project',
        isAdmin: true,
        getUrl: (value) =>
          `${this.getUrl('/identity/project')}/detail/${value}`,
      },
      {
        key: 'OS::Keystone::Role',
        isAdmin: true,
        getUrl: (value) => `${this.getUrl('/identity/role')}/detail/${value}`,
      },
      {
        key: 'OS::Keystone::User',
        isAdmin: true,
        getUrl: (value) => `${this.getUrl('/identity/user')}/detail/${value}`,
      },
      {
        key: 'OS::Neutron::FloatingIP',
        getUrl: (value) =>
          `${this.getUrl('/network/floatingip')}/detail/${value}`,
      },
      {
        key: 'OS::Neutron::LBaaS::LoadBalancer',
        getUrl: (value) =>
          `${this.getUrl('/network/load-balancers')}/detail/${value}`,
      },
      {
        key: 'OS::Neutron::Net',
        getUrl: (value) =>
          `${this.getUrl('/network/networks')}/detail/${value}`,
      },
      {
        key: 'OS::Neutron::Port',
        getUrl: (value) =>
          `${this.getUrl(
            '/network/virtual_adapter',
            '_admin'
          )}/detail/${value}`,
      },
      {
        key: 'OS::Neutron::QoSPolicy',
        getUrl: (value) =>
          `${this.getUrl('/network/qos-policy')}/detail/${value}`,
      },
      {
        key: 'OS::Neutron::Router',
        getUrl: (value) => `${this.getUrl('/network/router')}/detail/${value}`,
      },
      {
        key: 'OS::Neutron::SecurityGroup',
        getUrl: (value) =>
          `${this.getUrl('/network/security-group')}/detail/${value}`,
      },
      {
        key: 'OS::Nova::Flavor',
        isAdmin: true,
        getUrl: (value) => `${this.getUrl('/compute/flavor')}/detail/${value}`,
      },
      {
        key: 'OS::Nova::KeyPair',
        getUrl: (value) => `/compute/keypair/detail/${value}`,
      },
      {
        key: 'OS::Nova::Server',
        getUrl: (value) =>
          `${this.getUrl('/compute/instance')}/detail/${value}`,
      },
      {
        key: 'OS::Nova::ServerGroup',
        getUrl: (value) =>
          `${this.getUrl('/compute/server-group')}/detail/${value}`,
      },
      {
        key: 'OS::Octavia::LoadBalancer',
        getUrl: (value) =>
          `${this.getUrl('/network/load-balancers')}/detail/${value}`,
      },
    ];
  }

  getResourceUrl = (value, record) => {
    if (!value) {
      return '-';
    }
    const { resource_type: type } = record;
    const item = this.resourceMap.find((it) => it.key === type);
    if (!item) {
      return value;
    }
    const { isAdmin, getUrl } = item;
    if (isAdmin) {
      return this.isAdminPage ? (
        <Link to={getUrl(value, record)}>{value}</Link>
      ) : (
        value
      );
    }
    if (getUrl) {
      return <Link to={getUrl(value, record)}>{value}</Link>;
    }
    return value;
  };

  getColumns = () => [
    {
      title: t('Stack Resource'),
      dataIndex: 'logical_resource_id',
    },
    {
      title: t('Resource'),
      dataIndex: 'physical_resource_id',
      render: (value, record) => this.getResourceUrl(value, record),
    },
    {
      title: t('Stack Resource Type'),
      dataIndex: 'resource_type',
    },
    {
      title: t('Created At'),
      dataIndex: 'creation_time',
      isHideable: true,
      valueRender: 'sinceTime',
    },
    {
      title: t('Resource Status'),
      dataIndex: 'resource_status',
      isHideable: true,
      render: (value) => stackStatus[value] || value,
    },
    {
      title: t('Resource Status Reason'),
      dataIndex: 'resource_status_reason',
      isStatus: false,
      isHideable: true,
      width: 300,
    },
  ];
}
