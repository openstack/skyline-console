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
import Base from 'containers/BaseDetail';

export class BaseDetail extends Base {
  get leftCards() {
    return [this.baseCard];
  }

  get rightCards() {
    return [this.configCard];
  }

  get baseCard() {
    const options = [
      {
        label: t('Name'),
        dataIndex: 'binary',
      },
      {
        label: t('Topic'),
        dataIndex: 'topic',
      },
      {
        label: t('Resources Synced'),
        dataIndex: 'resources_synced',
      },
      {
        label: t('Heartbeat Timestamp'),
        dataIndex: 'heartbeat_timestamp',
        valueRender: 'toLocalTime',
      },
      {
        label: t('Started At'),
        dataIndex: 'started_at',
      },
    ];
    return {
      title: t('Base Info'),
      options,
    };
  }

  get configCard() {
    const { configurations = '{}' } = this.detailData || {};
    const content = (
      <div>
        <pre>{JSON.stringify(configurations, null, 4)}</pre>
      </div>
    );
    const options = [
      {
        label: '',
        content,
      },
    ];
    return {
      labelCol: 0,
      title: t('Configuration'),
      options,
    };
  }
}

export default inject('rootStore')(observer(BaseDetail));
