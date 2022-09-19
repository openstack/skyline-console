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
import globalObjectStore, { ObjectStore } from 'stores/swift/object';
import { allCanChangePolicy } from 'resources/skyline/policy';
import { isFile } from 'resources/swift/container';

export class Edit extends ModalAction {
  static id = 'edit-file';

  static title = t('Edit');

  static policy = allCanChangePolicy;

  init() {
    this.store = new ObjectStore();
    this.maxSize = 1;
  }

  static allowed = (item, containerProps) => {
    const { isAdminPage } = containerProps;
    return Promise.resolve(isFile(item) && !isAdminPage);
  };

  get name() {
    return t('Upload File');
  }

  get instanceName() {
    return this.item.shortName;
  }

  get hasRequestCancelCallback() {
    return true;
  }

  get tips() {
    return t(
      'Editing only changes the content of the file, not the file name.'
    );
  }

  get defaultValue() {
    const { folder, shortName, container } = this.item;
    return {
      container,
      dest_folder: folder,
      shortName,
    };
  }

  sizeValidate = (rule, value) => {
    if (!value) {
      return Promise.reject(t('Please select a file'));
    }
    const { size } = value;
    if (size <= this.maxSize * 1024 * 1024 * 1024) {
      return Promise.resolve();
    }
    return Promise.reject(
      t(
        'Please upload files smaller than { size }GiB on the page. It is recommended to upload files over { size }GiB using API.',
        { size: this.maxSize }
      )
    );
  };

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
        name: 'file',
        label: t('Select File'),
        type: 'upload',
        required: true,
        validator: this.sizeValidate,
      },
    ];
  }

  onSubmit = async (values) => {
    const { container, file } = values;
    const config = this.getUploadRequestConf();
    return this.store.updateFile(container, file, this.item.name, config);
  };
}

export default inject('rootStore')(observer(Edit));
