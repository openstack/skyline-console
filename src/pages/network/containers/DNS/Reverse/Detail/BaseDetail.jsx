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
    return [this.baseInfoCard];
  }

  get baseInfoCard() {
    const options = [
      {
        label: t('Address'),
        dataIndex: 'address',
      },
      {
        label: t('PTR Domain Name'),
        dataIndex: 'ptrdname',
      },
      {
        label: t('Description'),
        dataIndex: 'description',
      },
      {
        label: t('ID'),
        dataIndex: 'id',
      },
      {
        label: t('Time To Live'),
        dataIndex: 'ttl',
      },
      {
        label: t('Status'),
        dataIndex: 'status',
      },
      {
        label: t('Action'),
        dataIndex: 'action',
      },
    ];

    return {
      title: t('Base Info'),
      options,
    };
  }
}

export default inject('rootStore')(observer(BaseDetail));
