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
import { SubnetStore } from 'stores/neutron/subnet';
import IPopover from './Popover';

export default function PopoverSubnets(props) {
  const { subnetIds = [], title = '' } = props;
  if (!subnetIds.length) {
    return null;
  }
  const getRequests = () => {
    return subnetIds.map((i) => new SubnetStore().fetchDetail({ id: i }));
  };
  const columns = [
    {
      dataIndex: 'name',
      title: t('Name'),
    },
    {
      dataIndex: 'cidr',
      title: t('CIDR'),
    },
  ];
  return <IPopover columns={columns} getRequests={getRequests} title={title} />;
}
