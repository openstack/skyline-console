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
import Base from 'containers/List';
import globalSettingStore from 'stores/skyline/setting';
import { onlyAdminCanReadPolicy } from 'resources/skyline/policy';
import actionConfigs from './actions';

export class Setting extends Base {
  init() {
    this.store = globalSettingStore;
  }

  get policy() {
    return onlyAdminCanReadPolicy;
  }

  get name() {
    return t('settings');
  }

  get rowKey() {
    return 'key';
  }

  get hideCustom() {
    return true;
  }

  get actionConfigs() {
    return actionConfigs;
  }

  getColumns = () => [
    {
      title: t('Type'),
      dataIndex: 'key',
    },
    {
      title: t('Effective Mode'),
      dataIndex: 'restart_service',
      titleTip: t('Effective mode after configuration changes'),
      render: (value) =>
        value ? t('Take effect after restart') : t('Immediate effect'),
    },
  ];

  get searchFilters() {
    return [];
  }
}

export default inject('rootStore')(observer(Setting));
