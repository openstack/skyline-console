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
import { inject, observer } from 'mobx-react';
import Base from 'containers/BaseDetail';
import { shareProtocol } from 'resources/manila/share';
import { getYesNo } from 'utils/index';

export class BaseDetail extends Base {
  get leftCards() {
    const cards = [this.baseInfoCard, this.shareTypeCard];
    const { share_network_id, share_group_id } = this.detailData;
    if (share_network_id) {
      cards.push(this.shareNetworkCard);
    }
    if (share_group_id) {
      cards.push(this.shareGroupCard);
    }
    return cards;
  }

  get rightCards() {
    return [this.exportLocationsCard];
  }

  get baseInfoCard() {
    const options = [
      {
        label: t('Project ID'),
        dataIndex: 'project_id',
      },
      {
        label: t('Availability Zone'),
        dataIndex: 'availability_zone',
      },
      {
        label: t('Host'),
        dataIndex: 'host',
      },
      {
        label: t('Size'),
        dataIndex: 'size',
        unit: 'GiB',
      },
      {
        label: t('Protocol'),
        dataIndex: 'share_proto',
        valueMap: shareProtocol,
      },
      {
        label: t('Public'),
        dataIndex: 'is_public',
        valueRender: 'yesNo',
      },
      {
        label: t('Mount snapshot support'),
        dataIndex: 'mount_snapshot_support',
        valueRender: 'yesNo',
      },
    ];

    return {
      title: t('Base Info'),
      options,
    };
  }

  get shareTypeCard() {
    const options = [
      {
        label: t('Share Type ID'),
        dataIndex: 'share_type',
      },
      {
        label: t('Share Type Name'),
        dataIndex: 'share_type_name',
      },
    ];

    return {
      title: t('Share Type'),
      options,
    };
  }

  get shareNetworkCard() {
    const { shareNetwork } = this.detailData;
    const options = [
      {
        label: t('Share Network'),
        dataIndex: 'share_network_id',
        render: (value) => {
          if (!value) {
            return '-';
          }
          const link = this.getLinkRender(
            'shareNetworkDetail',
            shareNetwork.name,
            {
              id: value,
            }
          );
          return link;
        },
      },
    ];
    return {
      title: t('Share Network'),
      options,
    };
  }

  get shareGroupCard() {
    const { shareGroup } = this.detailData;
    const options = [
      {
        label: t('Share Group'),
        dataIndex: 'share_group_id',
        render: (value) => {
          if (!value) {
            return '-';
          }
          const link = this.getLinkRender('shareGroupDetail', shareGroup.name, {
            id: value,
          });
          return link;
        },
      },
    ];
    return {
      title: t('Share Group'),
      options,
    };
  }

  get exportLocationsCard() {
    const { exportLocations = [] } = this.detailData || {};
    const options = exportLocations.map((location, index) => {
      return {
        label: `${t('Export Location')} ${index + 1}`,
        dataIndex: 'exportLocations',
        render: () => {
          return (
            <div key={location.id}>
              <div>
                <span style={{ fontWeight: 'bold' }}>{t('Path')}: </span>
                {location.path}
              </div>
              <div>
                <span style={{ fontWeight: 'bold' }}>{t('Preferred')}: </span>
                {getYesNo(location.preferred)}
              </div>
              <div>
                <span style={{ fontWeight: 'bold' }}>
                  {t('Is admin only')}:
                </span>
                {getYesNo(location.is_admin_only)}
              </div>
              <div>
                <span style={{ fontWeight: 'bold' }}>
                  {t('Share Replica ID')}:{' '}
                </span>
                {location.share_instance_id}
              </div>
            </div>
          );
        },
      };
    });
    return {
      title: t('Export Locations'),
      options,
      labelCol: 4,
    };
  }
}

export default inject('rootStore')(observer(BaseDetail));
