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
import { Badge } from 'antd';
import { DomainStore } from 'stores/keystone/domain';
import Base from 'containers/TabDetail';
import User from '../../User';

export class DomainDetail extends Base {
  get name() {
    return t('domain');
  }

  get policy() {
    return 'identity:get_domain';
  }

  get listUrl() {
    return this.getRoutePath('domain');
  }

  get detailInfos() {
    return [
      {
        title: t('Domain Name'),
        dataIndex: 'name',
      },
      {
        title: t('Enabled'),
        dataIndex: 'enabled',
        isHideable: true,
        render: (val) => {
          if (val === true) {
            return <Badge color="green" text={t('Yes')} />;
          }
          return <Badge color="red" text={t('No')} />;
        },
      },
      {
        title: t('User Num'),
        dataIndex: 'user_num',
      },
      {
        title: t('Description'),
        dataIndex: 'description',
      },
    ];
  }

  get tabs() {
    const tabs = [
      {
        title: t('User List'),
        key: 'user',
        component: User,
      },
    ];
    return tabs;
  }

  goEdit = () => {
    const {
      params: { id },
    } = this.props.match;
    this.routing.push(`${this.listUrl}/edit/${id}`);
  };

  init() {
    this.store = new DomainStore();
  }
}

export default inject('rootStore')(observer(DomainDetail));
