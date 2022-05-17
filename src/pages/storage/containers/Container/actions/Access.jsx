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
import globalContainerStore, { ContainerStore } from 'stores/swift/container';
import { allCanChangePolicy } from 'resources/skyline/policy';

export class Access extends ModalAction {
  static id = 'access';

  static title = t('Update Access');

  static policy = allCanChangePolicy;

  static allowed = (_, containerProps) => {
    const { isAdminPage } = containerProps;
    return Promise.resolve(!isAdminPage);
  };

  get name() {
    return t('Update Access');
  }

  init() {
    this.detailStore = new ContainerStore();
    this.fetchDetail();
  }

  async fetchDetail() {
    await this.detailStore.fetchDetail({ name: this.item.name });
    this.updateDefaultValue();
  }

  get defaultValue() {
    const { is_public } = this.detailStore.detail || {};
    return {
      isPublic: is_public || false,
    };
  }

  get formItems() {
    return [
      {
        name: 'isPublic',
        label: t('Public Access'),
        type: 'switch',
        tip: t(
          'A public container will allow anyone to use the objects in your container through a public URL.'
        ),
      },
    ];
  }

  onSubmit = async (value) => {
    const { isPublic = false } = value;
    return globalContainerStore.updatePublic(this.item.name, isPublic);
  };
}

export default inject('rootStore')(observer(Access));
