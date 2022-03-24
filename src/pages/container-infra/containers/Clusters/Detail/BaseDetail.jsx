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
import { inject, observer } from 'mobx-react';
import React from 'react';

export class BaseDetail extends Base {

  get leftCards() {
    return [this.baseInfoCard, this.miscellaneousCard];
  }

  get rightCards() {
    return [this.nodesCard, this.labelCard, this.stackCard];
  }

  get baseInfoCard() {
    const options = [
      {
        label: t('Name'),
        dataIndex: "template.name",
        render: (value) => {
          return this.getLinkRender('containerInfraClusterTemplateDetail', value, { id: this.detailData.template.uuid })
        },
      },
      {
        label: t("ID"),
        dataIndex: "template.uuid"
      },
      {
        label: t("COE"),
        dataIndex: "template.coe",
      },
      {
        label: t("Image ID"),
        dataIndex: "template.image_id",
      }
    ];

    return {
      title: t('Cluster Template'),
      options,
    };
  }

  get miscellaneousCard() {
    const options = [
      {
        label: t('Discovery URL'),
        dataIndex: 'discovery_url',
      },
      {
        label: t('Cluster Create Timeout'),
        dataIndex: 'create_timeout',
      },
      {
        label: t('Keypair'),
        dataIndex: 'keypair',
      },
      {
        label: t('Docker Volume Size'),
        dataIndex: 'docker_volume_size',
      },
      {
        label: t('Master Flavor ID'),
        dataIndex: 'master_flavor_id',
      },
      {
        label: t('Node Flavor ID'),
        dataIndex: 'flavor_id',
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
    };
  }

  get nodesCard() {
    const options = [
      {
        label: t('Master Count'),
        dataIndex: 'master_count',
      },
      {
        label: t('Node Count'),
        dataIndex: 'node_count',
      },
      {
        label: t('API Address'),
        dataIndex: 'api_address',
      },
      {
        label: t('Master Addresses'),
        dataIndex: 'master_addresses',
      },
      {
        label: t('Node Addresses'),
        dataIndex: 'node_addresses',
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
          Object.entries(value).map(([key, val]) => {
            return (
              <React.Fragment>
                <ul>
                  <li>
                    {key} : {val}
                  </li>
                </ul>
              </React.Fragment>
            );
          }),
      },
    ];

    return {
      title: t('Labels'),
      labelCol: 2,
      options,
    };
  }

  get stackCard() {
    const options = [
      {
        label: t('Stack ID'),
        dataIndex: 'stack_id',
      },
      {
        label: t('Stack Faults'),
        dataIndex: 'faults',
        render: (value) => value ? Object.entries(value).map(([key, val]) => {
          return <React.Fragment><ul><li>{key} : {val}</li></ul></React.Fragment>
        }) : " - "
      },
    ];

    return {
      title: t('Stack'),
      labelCol: 2,
      options,
    };
  }
}

export default inject("rootStore")(observer(BaseDetail))