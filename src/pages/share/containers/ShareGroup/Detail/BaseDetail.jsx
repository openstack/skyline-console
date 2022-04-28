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

export class BaseDetail extends Base {
  get leftCards() {
    return [this.baseInfoCard, this.shareNetworkCard];
  }

  get rightCards() {
    return [this.shareGroupTypeCard];
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
    ];

    return {
      title: t('Base Info'),
      options,
    };
  }

  get shareGroupTypeCard() {
    const { shareGroupType, shareTypes } = this.detailData;
    const options = [
      {
        label: t('Share Group Type'),
        dataIndex: 'share_group_type',
        render: () => {
          const { id, name } = shareGroupType;
          if (!this.isAdminPage) {
            return `${name}(${id})`;
          }
          const link = this.getLinkRender('shareGroupTypeDetail', name, {
            id,
          });
          return link;
        },
      },
      {
        label: t('Share Types'),
        dataIndex: 'share_types',
        render: () => {
          if (!this.isAdminPage) {
            return shareTypes.map((it) => {
              const { id, name } = it || {};
              if (!name) {
                return id;
              }
              return (
                <div key={id}>
                  {name}({id})
                </div>
              );
            });
          }
          return shareTypes.map((it) => {
            const { id, name } = it || {};
            if (!id) {
              return null;
            }
            const link = this.getLinkRender('shareTypeDetail', name || id, {
              id,
            });
            return <div key={id}>{link}</div>;
          });
        },
      },
    ];

    return {
      title: t('Share Group Type'),
      options,
      labelCol: 4,
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
}

export default inject('rootStore')(observer(BaseDetail));
