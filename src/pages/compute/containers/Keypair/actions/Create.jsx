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
import globalKeypairStore from 'stores/nova/keypair';
import FileSaver from 'file-saver';

@inject('rootStore')
@observer
export default class CreateKeypair extends ModalAction {
  static id = 'create-keypair';

  static title = t('Create Keypair');

  get name() {
    return t('Create Keypair');
  }

  onSubmit = (values) => {
    const { name, public_key } = values;
    const params = {
      name,
      public_key,
      type: 'ssh',
    };
    return globalKeypairStore.create(params).then((res) => {
      if (!public_key) {
        const {
          keypair: { private_key: privateKey },
        } = res;
        const filename = `${name}.pem`;
        const blob = new Blob([privateKey], {
          type: 'text/plain;charset=utf-8',
        });
        FileSaver.saveAs(blob, filename);
      }
    });
  };

  get defaultValue() {
    return {
      type: 'create',
    };
  }

  get createTypeList() {
    return [
      { value: 'create', label: t('Create Keypair') },
      { value: 'import', label: t('Import Keypair') },
    ];
  }

  static policy = 'os_compute_api:os-keypairs:create';

  static allowed = () => Promise.resolve(true);

  get formItems() {
    const { type } = this.state;
    const isCreate = type === 'create';
    return [
      {
        name: 'type',
        label: t('Create Type'),
        type: 'radio',
        options: this.createTypeList,
      },
      {
        name: 'name',
        label: t('Name'),
        type: 'input-name',
        required: true,
        isKeypair: true,
      },
      {
        name: 'public_key',
        label: t('Public Key'),
        type: 'textarea-from-file',
        hidden: isCreate,
        required: !isCreate,
      },
    ];
  }
}
