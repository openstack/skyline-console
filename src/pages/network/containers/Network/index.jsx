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

import { observer, inject } from 'mobx-react';
import Base from 'containers/TabList';
import ProjectNetwork from './ProjectNetwork';
import SharedNetwork from './SharedNetwork';
import ExtNetwork from './ExtNetwork';
import AdminNetwork from './AdminNetwork';

@inject('rootStore')
@observer
export default class Network extends Base {
  get tabs() {
    const tabs = [
      {
        title: t('Current Project Network'),
        key: 'projectNetwork',
        component: ProjectNetwork,
      },
      {
        title: t('Shared Network'),
        key: 'sharedNetwork',
        component: SharedNetwork,
      },
      {
        title: t('External Network'),
        key: 'externalNetwork',
        component: ExtNetwork,
      },
    ];
    if (this.hasAdminRole) {
      tabs.push({
        title: t('All Network'),
        key: 'allNetwork',
        component: AdminNetwork,
      });
    }
    return tabs;
  }
}
