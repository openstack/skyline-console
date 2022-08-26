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
import { accessRuleStatus } from 'resources/manila/share';
import { getYesNo } from 'utils/index';

export class BaseDetail extends Base {
  get leftCards() {
    return [this.baseInfoCard];
  }

  get rightCards() {
    return [this.exportLocations];
  }

  get baseInfoCard() {
    const options = [
      {
        label: t('Host'),
        dataIndex: 'host',
      },
      {
        label: t('Availability Zone'),
        dataIndex: 'availability_zone',
      },
      {
        label: t('Share Network'),
        dataIndex: 'share_network_id',
      },
      {
        label: t('Share Server'),
        dataIndex: 'share_server_id',
      },
      {
        label: t('Share Id'),
        dataIndex: 'share_id',
      },
      {
        label: t('Access Rules Status'),
        dataIndex: 'access_rules_status',
        valueMap: accessRuleStatus,
      },
      {
        label: t('Progress'),
        dataIndex: 'progress',
      },
      {
        label: t('Cast Rules To Read Only'),
        dataIndex: 'cast_rules_to_readonly',
        valueRender: 'yesNo',
      },
    ];

    return {
      title: t('Base Info'),
      options,
    };
  }

  get exportLocations() {
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
