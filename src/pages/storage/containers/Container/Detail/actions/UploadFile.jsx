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

export class UploadFile extends ModalAction {
  static id = 'upload-file';

  static title = t('Upload File');

  static policy = allCanChangePolicy;

  init() {
    this.store = new ObjectStore();
    this.maxSize = 1;
  }

  static allowed = (_, containerProps) => {
    const { isAdminPage } = containerProps;
    return Promise.resolve(!isAdminPage);
  };

  get name() {
    return t('Upload File');
  }

  get instanceName() {
    return this.values.file.name;
  }

  get hasRequestCancelCallback() {
    return true;
  }

  get defaultValue() {
    const { name, folder } = globalObjectStore.container || {};
    return {
      container: name,
      dest_folder: folder,
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
        label: t('Dest Folder'),
        type: 'label',
        hidden: !folder,
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
    const { container, ...rest } = values;
    const config = this.getUploadRequestConf();
    return this.store.createFile(container, rest, config);
  };
}

export default inject('rootStore')(observer(UploadFile));
