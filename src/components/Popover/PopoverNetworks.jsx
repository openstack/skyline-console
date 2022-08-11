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
import { NetworkStore } from 'stores/neutron/network';
import { networkStatus } from 'resources/neutron/network';
import IPopover from './Popover';

export default function PopoverNetworks(props) {
  const { networkIds = [] } = props;
  if (!networkIds.length) {
    return null;
  }
  const getRequests = () => {
    return networkIds.map((i) => new NetworkStore().fetchDetail({ id: i }));
  };
  const columns = [
    {
      dataIndex: 'name',
      title: t('Name'),
    },
    {
      title: t('External'),
      dataIndex: 'router:external',
      valueRender: 'yesNo',
    },
    {
      title: t('Shared'),
      dataIndex: 'shared',
      valueRender: 'yesNo',
    },
    {
      title: t('Status'),
      dataIndex: 'status',
      render: (value) => networkStatus[value] || value,
    },
  ];
  return <IPopover columns={columns} getRequests={getRequests} />;
}
