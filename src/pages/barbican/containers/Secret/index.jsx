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
import { observer, inject } from 'mobx-react';
import BaseList from 'containers/List';
import globalSecretsStore from 'stores/barbican/secrets';
import { Badge } from 'antd';
import actionConfigs from './actions';

export class SecretList extends BaseList {
  init() {
    this.store = globalSecretsStore;
  }

  get name() {
    return t('Secrets');
  }

  get policy() {
    return 'barbican:secret:get';
  }

  getColumns() {
    return [
      {
        title: t('ID/Name'),
        dataIndex: 'name',
        routeName: this.getRouteName('secretDetail'),
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
        title: t('Algorithm'),
        dataIndex: 'algorithm',
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

  get actionConfigs() {
    return actionConfigs;
  }

  get searchFilters() {
    return [
      {
        label: t('Name'),
        name: 'name',
      },
      {
        label: t('Algorithm'),
        name: 'algorithm',
      },
    ];
  }
}

export default inject('rootStore')(observer(SecretList));
