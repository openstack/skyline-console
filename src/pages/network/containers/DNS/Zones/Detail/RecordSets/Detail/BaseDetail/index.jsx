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
    return [this.baseInfoCard, this.modificationTimesCard];
  }

  get rightCards() {
    return [this.associationsCard];
  }

  get baseInfoCard() {
    const options = [
      {
        label: t('Action'),
        dataIndex: 'action',
      },
      {
        label: t('Records'),
        dataIndex: 'records',
        render: (value) => value.map((item) => <div>{item}</div>),
        // render: (value) => value.join(" - ")
      },
      {
        label: t('TTL'),
        dataIndex: 'ttl',
      },
      {
        label: t('Version'),
        dataIndex: 'version',
      },
    ];

    return {
      title: t('Base Info'),
      labelCol: 6,
      contentCol: 18,
      options,
    };
  }

  get modificationTimesCard() {
    const options = [
      {
        label: t('Created At'),
        dataIndex: 'created_at',
        valueRender: 'toLocalTime',
      },
      {
        label: t('Updated At'),
        dataIndex: 'updated_at',
        valueRender: 'toLocalTime',
      },
    ];

    return {
      title: t('Modification Times'),
      labelCol: 6,
      contentCol: 18,
      options,
    };
  }

  get associationsCard() {
    const options = [
      {
        label: t('Zone ID'),
        dataIndex: 'zone_id',
        copyable: true,
      },
      {
        label: t('Zone Name'),
        dataIndex: 'zone_name',
      },
      {
        label: t('Project ID'),
        dataIndex: 'project_id',
        copyable: true,
      },
    ];

    return {
      title: t('Associations'),
      // labelCol: 4,
      // contentCol: 18,
      options,
    };
  }
}

export default inject('rootStore')(observer(BaseDetail));
