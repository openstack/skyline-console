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
import { SETTING_DESC } from 'resources/skyline/setting';
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

  getDesc(record) {
    const { key } = record;
    return SETTING_DESC[key] || '-';
  }

  get modeOptions() {
    return [
      { key: false, label: t('Immediate effect') },
      { key: true, label: t('Take effect after restart') },
    ];
  }

  getColumns() {
    return [
      {
        title: t('Parameter'),
        dataIndex: 'key',
      },
      {
        title: t('Effective Mode'),
        dataIndex: 'restart_service',
        titleTip: t('Effective mode after configuration changes'),
        render: (value) => {
          const item = this.modeOptions.find((m) => m.key === value);
          return item?.label || '-';
        },
      },
      {
        title: t('Description'),
        dataIndex: 'description',
        render: (value, record) => this.getDesc(record),
      },
    ];
  }

  get searchFilters() {
    return [
      {
        name: 'key',
        label: t('Parameter'),
      },
      {
        name: 'restart_service',
        label: t('Effective Mode'),
        options: this.modeOptions,
      },
      {
        name: 'description',
        label: t('Description'),
        filterFunc: (record, val, data) => {
          const desc = this.getDesc(data).toLowerCase();
          return desc.includes(val.toLowerCase());
        },
      },
    ];
  }
}

export default inject('rootStore')(observer(Setting));
