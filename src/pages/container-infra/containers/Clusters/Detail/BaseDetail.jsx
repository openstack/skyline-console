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

import Base from 'containers/BaseDetail';
import { isEmpty } from 'lodash';
import { inject, observer } from 'mobx-react';
import React from 'react';

export class BaseDetail extends Base {
  get leftCards() {
    return [this.templateCard, this.networkCard, this.miscellaneousCard];
  }

  get rightCards() {
    return [this.nodesCard, this.labelCard, this.stackCard];
  }

  get templateCard() {
    const { template = {} } = this.detailData;
    const templateUrl = template?.name
      ? this.getLinkRender(
          'containerInfraClusterTemplateDetail',
          template.name,
          {
            id: template.uuid,
          }
        )
      : '-';

    const options = [
      {
        label: t('Name'),
        dataIndex: 'template.name',
        content: templateUrl,
      },
      {
        label: t('COE'),
        dataIndex: 'template.coe',
      },
    ];

    return {
      title: t('Cluster Template'),
      options,
      labelCol: 6,
      contentCol: 18,
    };
  }

  get networkCard() {
    const {
      fixed_network,
      original_fixed_network,
      fixedNetwork: { name: fixedName } = {},
      fixed_subnet,
      original_fixed_subnet,
      fixedSubnet: { name: subName } = {},
    } = this.detailData || {};
    const fixedNetworkUrl = original_fixed_network
      ? `${original_fixed_network} (${t('The resource has been deleted')})`
      : fixed_network
      ? this.getLinkRender('networkDetail', fixedName || fixed_network, {
          id: fixed_network,
        })
      : '-';
    const subnetUrl = original_fixed_subnet
      ? `${original_fixed_subnet} (${t('The resource has been deleted')})`
      : fixed_network && fixed_subnet
      ? this.getLinkRender('subnetDetail', subName || fixed_subnet, {
          networkId: fixed_network,
          id: fixed_subnet,
        })
      : '-';

    const options = [
      {
        label: t('Fixed Network'),
        content: fixedNetworkUrl,
      },
      {
        label: t('Fixed Subnet'),
        content: subnetUrl,
      },
    ];

    return {
      title: t('Network'),
      options,
    };
  }

  get miscellaneousCard() {
    const { original_keypair, keypair } = this.detailData;

    const keypairUrl = original_keypair
      ? `${original_keypair} (${t('The resource has been deleted')})`
      : keypair
      ? this.getLinkRender('keypairDetail', keypair, {
          id: keypair,
        })
      : '-';

    const options = [
      {
        label: t('Discovery URL'),
        dataIndex: 'discovery_url',
        render: (value) =>
          value ? (
            <a href={value} target="blank">
              {value}
            </a>
          ) : (
            '-'
          ),
      },
      {
        label: t('Timeout(Minute)'),
        dataIndex: 'create_timeout',
      },
      {
        label: t('Keypair'),
        content: keypairUrl,
        hidden: this.isAdminPage,
      },
      {
        label: t('Docker Volume Size (GiB)'),
        dataIndex: 'docker_volume_size',
      },
      {
        label: t('COE Version'),
        dataIndex: 'coe_version',
      },
      {
        label: t('Container Version'),
        dataIndex: 'container_version',
      },
    ];

    return {
      title: t('Miscellaneous'),
      options,
      labelCol: 12,
      contentCol: 12,
    };
  }

  get nodesCard() {
    const {
      master_flavor_id,
      original_master_flavor_id,
      masterFlavor: { name: masterFlavorName } = {},
      flavor_id,
      original_flavor_id,
      flavor: { name: flavorName } = {},
    } = this.detailData;

    const masterFlavorUrl = original_master_flavor_id
      ? `${original_master_flavor_id} (${t('The resource has been deleted')})`
      : master_flavor_id
      ? this.getLinkRender(
          'flavorDetail',
          masterFlavorName || master_flavor_id,
          {
            id: master_flavor_id,
          }
        )
      : '-';

    const flavorUrl = original_flavor_id
      ? `${original_flavor_id} (${t('The resource has been deleted')})`
      : flavor_id
      ? this.getLinkRender('flavorDetail', flavorName || flavor_id, {
          id: flavor_id,
        })
      : '-';

    const options = [
      {
        label: t('Master Node Flavor'),
        content: masterFlavorUrl,
      },
      {
        label: t('Number of Master Nodes'),
        dataIndex: 'master_count',
      },
      {
        label: t('Node Flavor'),
        content: flavorUrl,
      },
      {
        label: t('Number of Nodes'),
        dataIndex: 'node_count',
      },
      {
        label: t('API Address'),
        dataIndex: 'api_address',
      },
      {
        label: t('Master Node Addresses'),
        dataIndex: 'master_addresses',
        render: (value) =>
          value && value.length ? value.map((it) => <div>{it}</div>) : '-',
      },
      {
        label: t('Node Addresses'),
        dataIndex: 'node_addresses',
        render: (value) =>
          value && value.length ? value.map((it) => <div>{it}</div>) : '-',
      },
    ];

    return {
      title: t('Nodes'),
      labelCol: 3,
      options,
    };
  }

  get labelCard() {
    const options = [
      {
        label: t('Labels'),
        dataIndex: 'labels',
        render: (value) =>
          !isEmpty(value) ? (
            <ul>
              {Object.entries(value).map(([key, val]) => {
                return (
                  <li key={key}>
                    {key} : {val}
                  </li>
                );
              })}
            </ul>
          ) : (
            '-'
          ),
      },
    ];

    return {
      title: t('Additional Labels'),
      labelCol: 2,
      options,
    };
  }

  get stackCard() {
    const { stack: { id, stack_name: name } = {} } = this.detailData || {};

    const stackUrl = id
      ? this.getLinkRender('stackDetail', id, {
          id,
          name,
        })
      : '-';

    const options = [
      {
        label: t('Stack ID'),
        dataIndex: 'stack_id',
        content: stackUrl,
      },
      {
        label: t('Stack Faults'),
        dataIndex: 'faults',
        render: (value) =>
          !isEmpty(value) ? (
            <ul>
              {Object.entries(value).map(([key, val]) => {
                return (
                  <li key={key}>
                    {key} : {val}
                  </li>
                );
              })}
            </ul>
          ) : (
            '-'
          ),
      },
    ];

    return {
      title: t('Stack'),
      labelCol: 2,
      options,
    };
  }

  get healthCard() {
    const { health_status_reason = {} } = this.detailData || {};

    const logContent = !isEmpty(health_status_reason) ? (
      <ul>
        {Object.entries(health_status_reason).map(([key, val]) => {
          return (
            <li key={key}>
              {key} : {val}
            </li>
          );
        })}
      </ul>
    ) : (
      '-'
    );

    const options = [
      {
        label: t('Log'),
        content: logContent,
      },
    ];

    return {
      title: t('Health Checking Log'),
      labelCol: 2,
      options,
    };
  }
}

export default inject('rootStore')(observer(BaseDetail));
