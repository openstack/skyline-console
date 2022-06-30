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
import { ExtraSpecStore } from 'stores/manila/extra-spec';
import actionConfigs from './actions';

export class ExtraSpecs extends Base {
  init() {
    this.store = new ExtraSpecStore();
  }

  get policy() {
    return 'share_types_extra_spec:index';
  }

  get name() {
    return t('extra specs');
  }

  getColumns = () => [
    {
      title: t('Key'),
      dataIndex: 'keyName',
    },
    {
      title: t('Value'),
      dataIndex: 'value',
    },
  ];

  get actionConfigs() {
    return actionConfigs;
  }

  get searchFilters() {
    return [
      {
        label: t('Key'),
        name: 'keyName',
      },
    ];
  }
}

export default inject('rootStore')(observer(ExtraSpecs));
