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

import Base from 'containers/List';
import { inject, observer } from 'mobx-react';
import { ActionsLogStore } from 'src/stores/zun/action-log';
import { actionColumn, actionMap } from 'resources/zun/actions';
import { getOptions } from 'utils';

export class ActionLogs extends Base {
  init() {
    this.store = new ActionsLogStore();
  }

  get name() {
    return t('Action Logs');
  }

  get policy() {
    return 'container:actions';
  }

  getColumns = () => actionColumn(this);

  get searchFilters() {
    return [
      {
        label: t('Operation Name'),
        name: 'action',
        options: getOptions(actionMap),
      },
    ];
  }
}

export default inject('rootStore')(observer(ActionLogs));
