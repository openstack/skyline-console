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

import { observer, inject } from 'mobx-react';
import Base from 'containers/List';
import { StackResourceStore } from 'stores/heat/resource';
import { stackStatus } from 'resources/heat/stack';

export class Resource extends Base {
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
        routeName: 'volumeTypeDetail',
      },
      {
        key: 'OS::Cinder::QoSAssociation',
        isAdmin: true,
        routeName: 'volumeTypeQosDetail',
      },
      {
        key: 'OS::Cinder::QoSSpecs',
        isAdmin: true,
        routeName: 'volumeTypeQosDetail',
      },
      {
        key: 'OS::Cinder::Volume',
        routeName: 'volumeDetail',
      },
      {
        key: 'OS::Cinder::VolumeType',
        isAdmin: true,
        routeName: 'volumeTypeDetail',
      },
      {
        key: 'OS::Glance::WebImage',
        routeName: 'imageDetail',
      },
      {
        key: 'OS::Heat::Stack',
        routeName: 'stackDetail',
      },
      {
        key: 'OS::Ironic::Port',
        routeName: 'portDetail',
      },
      {
        key: 'OS::Keystone::Domain',
        routeName: 'domainDetail',
        isAdmin: true,
      },
      {
        key: 'OS::Keystone::Group',
        routeName: 'userGroupDetail',
        isAdmin: true,
      },
      {
        key: 'OS::Keystone::Project',
        routeName: 'projectDetail',
        isAdmin: true,
      },
      {
        key: 'OS::Keystone::Role',
        routeName: 'roleDetail',
        isAdmin: true,
      },
      {
        key: 'OS::Keystone::User',
        routeName: 'userDetail',
        isAdmin: true,
      },
      {
        key: 'OS::Neutron::FloatingIP',
        routeName: 'fipDetail',
      },
      {
        key: 'OS::Neutron::LBaaS::LoadBalancer',
        routeName: 'lbDetail',
      },
      {
        key: 'OS::Neutron::Net',
        routeName: 'networkDetail',
      },
      {
        key: 'OS::Neutron::Port',
        routeName: 'portDetail',
      },
      {
        key: 'OS::Neutron::QoSPolicy',
        routeName: 'networkQosDetail',
      },
      {
        key: 'OS::Neutron::Router',
        routeName: 'routerDetail',
      },
      {
        key: 'OS::Neutron::SecurityGroup',
        routeName: 'securityGroupDetail',
      },
      {
        key: 'OS::Nova::Flavor',
        isAdmin: true,
        routeName: 'flavorDetail',
      },
      {
        key: 'OS::Nova::KeyPair',
        routeName: 'keypairDetail',
      },
      {
        key: 'OS::Nova::Server',
        routeName: 'instanceDetail',
      },
      {
        key: 'OS::Nova::ServerGroup',
        routeName: 'serverGroupDetail',
      },
      {
        key: 'OS::Octavia::LoadBalancer',
        routeName: 'lbDetail',
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
    const { isAdmin, routeName } = item;
    const link = this.getLinkRender(routeName, value, { id: value });
    if (isAdmin) {
      return this.isAdminPage ? link : value;
    }
    if (routeName) {
      return link;
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
      valueMap: stackStatus,
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

export default inject('rootStore')(observer(Resource));
