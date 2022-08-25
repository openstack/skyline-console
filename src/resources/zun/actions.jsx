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
import { ActionsLogStore } from 'src/stores/zun/action-log';
import PopActionEvent from 'src/components/Popover/PopActionEvent';

export const actionEvent = {
  compute__do_container_start: t('Start Container'),
  compute__do_container_create: t('Create Container'),
  compute__do_container_stop: t('Stop Container'),
  compute__do_container_reboot: t('Reboot Container'),
  compute__do_container_restart: t('Restart Container'),
  compute__do_container_pause: t('Pause Container'),
  compute__do_container_unpause: t('Unpause Container'),
  compute__do_container_rebuild: t('Rebuild Container'),
  compute__do_container_kill: t('Kill Container'),
  compute__do_container_delete: t('Delete Container'),
};

export const actionMap = {
  create: t('Create'),
  stop: t('Stop'),
  reboot: t('Reboot'),
  start: t('Start'),
  restart: t('Restart'),
  pause: t('Pause'),
  unpause: t('Unpause'),
  resize: t('Resize'),
  rebuild: t('Rebuild'),
  kill: t('Kill'),
  delete: t('Delete'),
};

export const actionColumn = (self) => {
  return [
    {
      title: t('Operation Name'),
      dataIndex: 'action',
      valueMap: actionMap,
    },
    {
      title: t('Project ID/Name'),
      dataIndex: 'project_name',
      isHideable: true,
      hidden: !self.isAdminPage,
    },
    {
      title: t('Operation Time'),
      dataIndex: 'start_time',
      valueRender: 'toLocalTimeMoment',
    },
    {
      title: t('Request ID'),
      dataIndex: 'request_id',
      isHideable: true,
      render: (value, record) => (
        <>
          <span>{value}</span>
          <PopActionEvent
            id={record.container_uuid}
            requestId={value}
            store={new ActionsLogStore()}
            actionEvent={actionEvent}
          />
        </>
      ),
    },
    {
      title: t('User ID'),
      dataIndex: 'user_id',
      isHideable: true,
      hidden: !self.isAdminPage,
      render: (value) =>
        self.getLinkRender('userDetail', value, { id: value }, null),
    },
  ];
};
