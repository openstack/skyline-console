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
import { inject, observer } from 'mobx-react';

export class BaseDetail extends Base {
  get leftCards() {
    const cards = [this.baseInfoCard, this.containersCard];
    return cards;
  }

  get rightCards() {
    return [this.specCard];
  }

  get baseInfoCard() {
    const options = [
      {
        label: t('Status Reason'),
        dataIndex: 'status_reason',
      },
      {
        label: t('Project ID'),
        dataIndex: 'project_id',
      },
      {
        label: t('User ID'),
        dataIndex: 'user_id',
      },
    ];

    return {
      title: t('Capsule Type'),
      options,
    };
  }

  get containersCard() {
    const options = [
      {
        label: t('Containers'),
        dataIndex: 'containers',
        render: (value) =>
          value.map((it) => {
            return (
              <div key={it.uuid}>
                <b>{t('Container Name')}</b> : {it.name}
                <br />
                <b>{t('Container ID')}</b>: {it.uuid}
              </div>
            );
          }),
      },
    ];

    return {
      title: t('Containers'),
      options,
      labelCol: 0,
      contentCol: 24,
    };
  }

  get specCard() {
    const options = [
      {
        label: t('CPU'),
        dataIndex: 'cpu',
      },
      {
        label: t('Memory'),
        dataIndex: 'memory',
      },
      {
        label: t('Restart Policy'),
        dataIndex: 'restart_policy',
      },
      {
        label: t('Labels'),
        dataIndex: 'labels',
        render: (value) => value || ' - ',
      },
      {
        label: t('Links'),
        dataIndex: 'links',
        render: (value) =>
          value.map((it) => {
            return (
              <div key={it.href}>
                {it.href} : {it.rel}
              </div>
            );
          }),
      },
      {
        label: t('Addresses'),
        dataIndex: 'addresses',
        render: (value) => (value.length != null ? value : '-'),
      },
    ];

    return {
      title: t('Spec'),
      options,
    };
  }
}

export default inject('rootStore')(observer(BaseDetail));
