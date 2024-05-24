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
    const cards = [this.baseInfoCard];
    return cards;
  }

  get baseInfoCard() {
    const options = [
      {
        label: t('ID'),
        dataIndex: 'id',
      },
      {
        label: t('Project ID'),
        dataIndex: 'project_id',
      },
      {
        label: t('Object Type'),
        dataIndex: 'object_type',
      },
      {
        label: t('Object ID'),
        dataIndex: 'object_id',
      },
      {
        label: t('Action'),
        dataIndex: 'action',
      },
      {
        label: t('Target Tenant'),
        dataIndex: 'target_tenant',
      },
    ];

    return {
      title: t('Rbac Policy Detail'),
      options,
    };
  }
}

export default inject('rootStore')(observer(BaseDetail));
