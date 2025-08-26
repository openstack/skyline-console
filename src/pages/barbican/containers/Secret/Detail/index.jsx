// Copyright 2025 99cloud
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
import Base from 'containers/TabDetail';
import { SecretsStore } from 'stores/barbican/secrets';
import { Badge } from 'antd';
import actionConfigs from '../actions';
import BaseDetail from './BaseDetail';

export class SecretDetail extends Base {
  init() {
    this.store = new SecretsStore();
  }

  get policy() {
    return 'secret:get';
  }

  get name() {
    return t('Secret Detail');
  }

  get listUrl() {
    return this.getRoutePath('keyManagerSecret');
  }

  get actionConfigs() {
    return actionConfigs;
  }

  get detailInfos() {
    return [
      {
        title: t('ID'),
        dataIndex: 'id',
      },
      {
        title: t('Name'),
        dataIndex: 'name',
      },
      {
        title: t('Status'),
        dataIndex: 'expiration',
        valueRender: 'toLocalTime',
        render: (value) => {
          if (value) {
            const isExpired = value && new Date(value) < new Date();
            const statusText = t(isExpired ? 'Expired' : 'Active');
            const statusColor = isExpired ? '#D32F45' : '#3C9E6C';
            return <Badge color={statusColor} text={statusText} />;
          }
          return <Badge color="#3C9E6C" text="Active" />;
        },
      },
      {
        title: t('Secret Type'),
        dataIndex: 'secret_type',
      },
      {
        title: t('Algorithm'),
        dataIndex: 'algorithm',
      },
      {
        title: t('Mode'),
        dataIndex: 'mode',
      },
      {
        title: t('Expiration'),
        dataIndex: 'expiration',
        valueRender: 'toLocalTime',
      },
      {
        title: t('Created At'),
        dataIndex: 'created',
        valueRender: 'toLocalTime',
      },
    ];
  }

  get tabs() {
    return [
      {
        title: t('Detail Info'),
        key: 'detail_info',
        component: BaseDetail,
      },
    ];
  }
}

export default inject('rootStore')(observer(SecretDetail));
