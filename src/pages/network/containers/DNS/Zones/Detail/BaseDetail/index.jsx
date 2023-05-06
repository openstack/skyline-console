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

import { inject, observer } from 'mobx-react';
import Base from 'containers/BaseDetail';

export class BaseDetail extends Base {
  get leftCards() {
    return [this.baseInfoCard, this.modificationTimesCard];
  }

  get rightCards() {
    return [this.attributesCard, this.associationsCard];
  }

  get baseInfoCard() {
    const options = [
      {
        label: t('Action'),
        dataIndex: 'action',
      },
      {
        label: t('Serial'),
        dataIndex: 'serial',
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
      {
        label: t('Transferred'),
        dataIndex: 'transferred_at',
        valueRender: 'toLocalTime',
      },
    ];

    return {
      title: t('Modification Times'),
      options,
    };
  }

  get attributesCard() {
    const options = [
      {
        label: t('Attributes'),
        dataIndex: 'attributes',
        render: (value) => JSON.stringify(value),
      },
    ];

    return {
      title: t('Attributes'),
      options,
    };
  }

  get associationsCard() {
    const options = [
      {
        label: t('Pool ID'),
        dataIndex: 'pool_id',
      },
      {
        label: t('Project ID'),
        dataIndex: 'project_id',
      },
      {
        label: t('Masters'),
        dataIndex: 'masters',
        render: (value) => JSON.stringify(value),
      },
    ];

    return {
      title: t('Associations'),
      options,
    };
  }
}

export default inject('rootStore')(observer(BaseDetail));
