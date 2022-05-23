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
import React from 'react';
import { Link } from 'react-router-dom';
import { inject, observer } from 'mobx-react';

export class BaseDetail extends Base {
  get leftCards() {
    return [this.baseInfoCard, this.networkCard];
  }

  get rightCards() {
    return [this.specCard, this.labelCard];
  }

  get baseInfoCard() {
    const options = [
      {
        label: t('COE'),
        dataIndex: 'coe'
      },
      {
        label: t('Cluster Distro'),
        dataIndex: 'cluster_distro'
      },
      {
        label: t('Server Type'),
        dataIndex: 'server_type'
      },
      {
        label: t('Public'),
        dataIndex: 'public',
        valueRender: 'yesNo'
      },
      {
        label: t('Registry Enabled'),
        dataIndex: 'registry_enabled',
        valueRender: 'yesNo'
      },
      {
        label: t('TLS Disabled'),
        dataIndex: 'tls_disabled',
        valueRender: 'yesNo'
      },
    ];

    return {
      title: t('Cluster Type'),
      options
    };
  }

  get networkCard() {
    const options = [
      {
        label: t('Network Driver'),
        dataIndex: 'network_driver'
      },
      {
        label: t('HTTP Proxy'),
        dataIndex: 'http_proxy'
      },
      {
        label: t('HTTPS Proxy'),
        dataIndex: 'https_proxy'
      },
      {
        label: t('No Proxy'),
        dataIndex: 'no_proxy'
      },
      {
        label: t('External Network ID'),
        dataIndex: 'external_network_id'
      },
      {
        label: t('Fixed Network'),
        dataIndex: 'fixed_network'
      },
      {
        label: t('Fixed Subnet'),
        dataIndex: 'fixed_subnet'
      },
      {
        label: t('DNS'),
        dataIndex: 'dns_nameserver'
      },
      {
        label: t('Master LB Enabled'),
        dataIndex: 'master_lb_enabled',
        valueRender: 'yesNo'
      },
      {
        label: t('Floating IP Enabled'),
        dataIndex: 'floating_ip_enabled',
        valueRender: 'yesNo'
      },
    ];

    return {
      title: t('Network'),
      options,
    };
  }

  get specCard() {
    const image = this.detailData.image_id;
    const imageUrl = this.getRoutePath('imageDetail', { id: image });

    const keypair = this.detailData.keypair_id;
    const keypairUrl = this.getRoutePath('keypairDetail', { id: keypair });

    const options = [
      {
        label: t('Image ID'),
        content: <Link to={imageUrl}>{image}</Link>
      },
      {
        label: t('Keypair'),
        content: <Link to={keypairUrl}>{keypair}</Link>
      },
      {
        label: t('Flavor ID'),
        dataIndex: 'flavor_id'
      },
      {
        label: t('Master Flavor ID'),
        dataIndex: 'master_flavor_id'
      },
      {
        label: t('Volume Driver'),
        dataIndex: 'volume_driver'
      },
      {
        label: t('Docker Storage Driver'),
        dataIndex: 'docker_storage_driver'
      },
      {
        label: t('Docker Volume Size'),
        dataIndex: 'docker_volume_size'
      },
      {
        label: t('Insecure Registry'),
        dataIndex: 'insecure_registry'
      },
    ];

    return {
      title: t('Node Spec'),
      options,
    };
  }

  get labelCard() {
    const options = [
      {
        label: t('labels'),
        dataIndex: 'labels',
        render: (value) => value ? Object.entries(value).map(([key, val]) => {
          return <div key={key}><ul><li>{key} : {val}</li></ul></div>
        }) : '-'
      },
    ];

    return {
      title: t('Labels'),
      labelCol: 2,
      options,
    };
  }
}

export default inject("rootStore")(observer(BaseDetail))