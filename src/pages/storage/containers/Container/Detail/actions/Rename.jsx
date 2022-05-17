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
import { isFile } from 'resources/swift/container';

export class Rename extends ModalAction {
  static id = 'rename';

  static title = t('Rename');

  static policy = allCanChangePolicy;

  init() {
    this.store = globalObjectStore;
  }

  static allowed = (item) => Promise.resolve(isFile(item));

  get name() {
    return t('Rename');
  }

  get instanceName() {
    return this.item.shortName;
  }

  get defaultValue() {
    const { folder, shortName, container } = this.item;
    return {
      container,
      dest_folder: folder,
      shortName,
    };
  }

  get tip() {
    return t(
      'Rename is to copy the current file to the new file address and delete the current file, which will affect the creation time of the file.'
    );
  }

  get formItems() {
    const { folder } = globalObjectStore.container || {};
    return [
      {
        name: 'container',
        label: t('Container Name'),
        type: 'label',
      },
      {
        name: 'dest_folder',
        label: t('Folder Name'),
        type: 'label',
        hidden: !folder,
      },
      {
        name: 'shortName',
        label: t('Filename'),
        type: 'label',
      },
      {
        name: 'newname',
        label: t('Rename'),
        type: 'input-name',
        isSwiftFile: true,
        required: true,
        maxLength: 63,
      },
    ];
  }

  onSubmit = async (values) => {
    const { container, folder, name } = this.item;
    const { newname } = values;
    const newName = folder ? `${folder}/${newname}` : newname;
    return globalObjectStore.rename(container, name, newName);
  };
}

export default inject('rootStore')(observer(Rename));
