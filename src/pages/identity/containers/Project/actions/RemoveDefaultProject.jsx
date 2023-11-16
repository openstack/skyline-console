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

import { inject, observer } from 'mobx-react';
import { ModalAction } from 'containers/Action';
import globalUserStore from 'stores/keystone/user';

export class RemoveDefaultProject extends ModalAction {
  static id = 'remove-default-project';

  static title = t('Remove Default Project');

  static policy = 'identity:update_user';

  get name() {
    return t('Remove default project for user');
  }

  static policy = 'identity:update_user';

  static allowed = (item, containerProps) => {
    const { detail } = containerProps || {};
    const { default_project_id } = detail;
    return Promise.resolve(!!default_project_id);
  };

  get formItems() {
    return [
      {
        name: 'name',
        type: 'label',
        content: t('Are you sure to remove the default project?'),
      },
    ];
  }

  onSubmit = (value, containerProps) => {
    const {
      detail: { id },
    } = containerProps;
    return globalUserStore.setDefaultProject(id, null);
  };
}

export default inject('rootStore')(observer(RemoveDefaultProject));
