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
import { getLocalTimeStr } from 'utils/time';
import IPopover from './Popover';

export default function PopActionEvent({ id, requestId, store, actionEvent }) {
  const columns = [
    {
      title: t('Operation Name'),
      dataIndex: 'event',
      key: 'event',
      render: (value) => actionEvent[value] || value,
    },
    {
      title: t('Start Time'),
      dataIndex: 'start_time',
      key: 'start_time',
      render: (value) => getLocalTimeStr(value),
    },
    {
      title: t('End Time'),
      dataIndex: 'finish_time',
      key: 'finish_time',
      render: (value) => (value ? getLocalTimeStr(value) : '-'),
    },
    {
      title: t('Execution Result'),
      dataIndex: 'result',
      key: 'result',
      render: (value) => (value === 'Success' ? t('Success') : '-'),
    },
  ];
  const getData = async () => {
    const detail = (await store.fetchDetail({ id, requestId })) || {};
    const { events = [] } = detail;
    return events.slice().reverse();
  };
  return <IPopover columns={columns} getData={getData} />;
}
