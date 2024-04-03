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
import { inject, observer } from 'mobx-react';

export class BaseDetail extends Base {
  get leftCards() {
    const cards = [this.baseInfoCard, this.payloadCard];
    return cards;
  }

  get baseInfoCard() {
    const options = [
      {
        label: t('ID'),
        dataIndex: 'id',
      },
      {
        label: t('Host'),
        dataIndex: 'source_host_uuid',
        copyable: true,
      },
      {
        label: t('Generated Time'),
        dataIndex: 'generated_time',
        valueRender: 'toLocalTime',
      },
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
      title: t('Notification Detail'),
      options,
    };
  }

  get payloadCard() {
    const options = [
      {
        label: t('Event'),
        dataIndex: 'event',
      },
      {
        label: t('Instance UUID'),
        dataIndex: 'instance_uuid',
      },
      {
        label: t('VIR Domain Event'),
        dataIndex: 'vir_domain_event',
      },
    ];

    return {
      title: t('Payload'),
      sourceData: this.detailData.payload,
      options,
    };
  }
}

export default inject('rootStore')(observer(BaseDetail));
