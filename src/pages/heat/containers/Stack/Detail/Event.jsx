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
import { observer, inject } from 'mobx-react';
import Base from 'containers/List';
import { StackEventStore } from 'stores/heat/event';
import { stackStatus } from 'resources/heat/stack';

export class Event extends Base {
  init() {
    this.store = new StackEventStore();
  }

  get policy() {
    return 'events:index';
  }

  get aliasPolicy() {
    return 'heat:events:index';
  }

  get name() {
    return t('stack events');
  }

  get hideSearch() {
    return true;
  }

  getColumns = () => [
    {
      title: t('Event Time'),
      dataIndex: 'event_time',
      valueRender: 'toLocalTime',
    },
    {
      title: t('Stack Resource'),
      dataIndex: 'logical_resource_id',
      render: (it) => (
        <div style={{ wordWrap: 'break-word', wordBreak: 'break-word' }}>
          {it}
        </div>
      ),
    },
    {
      title: t('Resource'),
      dataIndex: 'physical_resource_id',
      render: (it) => (
        <div style={{ wordWrap: 'break-word', wordBreak: 'break-word' }}>
          {it}
        </div>
      ),
    },
    {
      title: t('Resource Status'),
      dataIndex: 'resource_status',
      isHideable: true,
      valueMap: stackStatus,
    },
    {
      title: t('Resource Status Reason'),
      dataIndex: 'resource_status_reason',
      isHideable: true,
      isStatus: false,
      width: 300,
    },
  ];
}

export default inject('rootStore')(observer(Event));
