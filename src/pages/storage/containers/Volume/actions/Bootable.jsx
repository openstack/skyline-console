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
import globalVolumeStore from 'stores/cinder/volume';

export class Bootable extends ModalAction {
  static id = 'volume-bootable';

  static title = t('Bootable');

  static buttonText = t('Bootable');

  static policy = 'volume:update';

  static allowed() {
    return Promise.resolve(true);
  }

  get name() {
    const { bootable } = this.values;
    return bootable ? t('Bootable') : t('Unbootable');
  }

  get defaultValue() {
    const { item } = this.props;
    return {
      bootable: item.bootable === 'true',
    };
  }

  onSubmit = ({ bootable }) => {
    const { id } = this.item;
    return globalVolumeStore.changeBootable(id, {
      bootable,
    });
  };

  get formItems() {
    return [
      {
        name: 'bootable',
        label: t('Bootable'),
        checkedText: t('Bootable'),
        uncheckedText: t('Unbootable'),
        type: 'switch',
        required: true,
      },
    ];
  }
}

export default inject('rootStore')(observer(Bootable));
