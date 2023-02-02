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
import Base from 'containers/BaseDetail';
import { inject, observer } from 'mobx-react';
import { isEmpty } from 'lodash';

export class BaseDetail extends Base {
  get leftCards() {
    return [this.baseInfoCard, this.networkCard];
  }

  get leftCardsStyle() {
    return {
      flex: 1,
    };
  }

  get rightCards() {
    return [this.specCard, this.labelCard];
  }

  get baseInfoCard() {
    const options = [
      {
        label: t('COE'),
        dataIndex: 'coe',
      },
      {
        label: t('Cluster Distro'),
        dataIndex: 'cluster_distro',
      },
      {
        label: t('Server Type'),
        dataIndex: 'server_type',
      },
      {
        label: t('Public'),
        dataIndex: 'public',
        valueRender: 'yesNo',
      },
      {
        label: t('Registry Enabled'),
        dataIndex: 'registry_enabled',
        valueRender: 'yesNo',
      },
      {
        label: t('TLS Disabled'),
        dataIndex: 'tls_disabled',
        valueRender: 'yesNo',
      },
    ];

    return {
      title: t('Cluster Type'),
      options,
    };
  }

  get networkCard() {
    const {
      external_network_id,
      original_external_network_id,
      externalNetwork: { name: externalName } = {},
      fixed_network,
      original_fixed_network,
      fixedNetwork: { name: fixedName } = {},
      fixed_subnet,
      original_fixed_subnet,
      fixedSubnet: { name: subName } = {},
    } = this.detailData || {};
    const externalNetworkUrl = original_external_network_id
      ? `${original_external_network_id} (${t(
          'The resource has been deleted'
        )})`
      : external_network_id
      ? this.getLinkRender(
          'networkDetail',
          externalName || external_network_id,
          {
            id: external_network_id,
          }
        )
      : '-';
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
        label: t('Network Driver'),
        dataIndex: 'network_driver',
      },
      {
        label: t('HTTP Proxy'),
        dataIndex: 'http_proxy',
      },
      {
        label: t('HTTPS Proxy'),
        dataIndex: 'https_proxy',
      },
      {
        label: t('No Proxy'),
        dataIndex: 'no_proxy',
      },
      {
        label: t('External Network'),
        content: externalNetworkUrl,
      },
      {
        label: t('Fixed Network'),
        content: fixedNetworkUrl,
      },
      {
        label: t('Fixed Subnet'),
        content: subnetUrl,
      },
      {
        label: t('DNS'),
        dataIndex: 'dns_nameserver',
      },
      {
        label: t('Master Node LB Enabled'),
        dataIndex: 'master_lb_enabled',
        valueRender: 'yesNo',
      },
      {
        label: t('Floating IP Enabled'),
        dataIndex: 'floating_ip_enabled',
        valueRender: 'yesNo',
      },
    ];

    return {
      title: t('Network'),
      options,
    };
  }

  get specCard() {
    const {
      image_id,
      original_image_id,
      image: { name: imageName } = {},
      keypair_id,
      original_keypair_id,
      flavor_id,
      original_flavor_id,
      flavor: { name: flavorName } = {},
      master_flavor_id,
      original_master_flavor_id,
      masterFlavor: { name: masterFlavorName } = {},
    } = this.detailData;
    const imageUrl = original_image_id
      ? `${original_image_id} (${t('The resource has been deleted')})`
      : image_id
      ? this.getLinkRender('imageDetail', imageName || image_id, {
          id: image_id,
        })
      : '-';

    const keypairUrl = original_keypair_id
      ? `${original_keypair_id} (${t('The resource has been deleted')})`
      : keypair_id
      ? this.getLinkRender('keypairDetail', keypair_id, {
          id: keypair_id,
        })
      : '-';

    const flavorUrl = original_flavor_id
      ? `${original_flavor_id} (${t('The resource has been deleted')})`
      : flavor_id
      ? this.getLinkRender('flavorDetail', flavorName || flavor_id, {
          id: flavor_id,
        })
      : '-';

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

    const options = [
      {
        label: t('Image'),
        content: imageUrl,
      },
      {
        label: t('Keypair'),
        content: keypairUrl,
        hidden: this.isAdminPage,
      },
      {
        label: t('Node Flavor'),
        content: flavorUrl,
      },
      {
        label: t('Master Node Flavor'),
        content: masterFlavorUrl,
      },
      {
        label: t('Volume Driver'),
        dataIndex: 'volume_driver',
      },
      {
        label: t('Docker Storage Driver'),
        dataIndex: 'docker_storage_driver',
      },
      {
        label: t('Docker Volume Size (GiB)'),
        dataIndex: 'docker_volume_size',
      },
      {
        label: t('Insecure Registry'),
        dataIndex: 'insecure_registry',
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
}

export default inject('rootStore')(observer(BaseDetail));
