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
import globalObjectStore from 'stores/swift/object';
import { allCanChangePolicy } from 'resources/skyline/policy';

export class CreateFolder extends ModalAction {
  static id = 'create';

  static title = t('Create Folder');

  static policy = allCanChangePolicy;

  init() {
    this.store = globalObjectStore;
  }

  static allowed = (_, containerProps) => {
    const { isAdminPage } = containerProps;
    return Promise.resolve(!isAdminPage);
  };

  get name() {
    return t('Create Folder');
  }

  get instanceName() {
    return this.values.folder_name;
  }

  get defaultValue() {
    const { name, folder } = this.store.container || {};
    return {
      container: name,
      dest_folder: folder,
    };
  }

  get formItems() {
    const { folder } = this.store.container || {};
    return [
      {
        name: 'container',
        label: t('Container Name'),
        type: 'label',
      },
      {
        name: 'dest_folder',
        label: t('Dest Folder'),
        type: 'label',
        hidden: !folder,
      },
      {
        name: 'folder_name',
        label: t('Folder Name'),
        type: 'input-name',
        required: true,
        isSwiftFile: true,
        maxLength: 63,
        validator: (rule, value) => {
          if (value.length < 2) {
            return Promise.reject(
              new Error(
                `${t('Invalid: ')}${t('Please input at least 2 characters.')}`
              )
            );
          }
          return Promise.resolve();
        },
      },
    ];
  }

  onSubmit = async (values) => {
    const { container, ...rest } = values;
    return globalObjectStore.createFolder(container, rest);
  };
}

export default inject('rootStore')(observer(CreateFolder));
