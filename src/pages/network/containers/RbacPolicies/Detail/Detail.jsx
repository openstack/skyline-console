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
import { objectTypes } from 'resources/neutron/rbac-policy';

export class BaseDetail extends Base {
  get leftCards() {
    const cards = [this.baseInfoCard];
    return cards;
  }

  get baseInfoCard() {
    const options = [
      {
        label: t('Object Type'),
        dataIndex: 'object_type',
        valueMap: objectTypes,
      },
      {
        label: t('Object ID'),
        dataIndex: 'object_id',
        render: (value) => {
          const { object_type } = this.detailData;
          if (object_type === 'network') {
            return this.getLinkRender('networkDetail', value, { id: value });
          }
          if (object_type === 'qos_policy') {
            return this.getLinkRender('networkQosDetail', value, {
              id: value,
            });
          }
          return value;
        },
      },
      {
        label: t('Object Name'),
        dataIndex: 'object.name',
      },
      {
        label: t('Action'),
        dataIndex: 'action',
      },
      {
        label: t('Target Tenant'),
        dataIndex: 'target_tenant',
        render: (value) => {
          if (value === '*') {
            return value;
          }
          const { targetProject } = this.detailData;
          return this.getLinkRender(
            'projectDetail',
            targetProject?.name || value,
            {
              id: value,
            }
          );
        },
      },
    ];

    return {
      title: t('Detail Info'),
      options,
    };
  }
}

export default inject('rootStore')(observer(BaseDetail));
