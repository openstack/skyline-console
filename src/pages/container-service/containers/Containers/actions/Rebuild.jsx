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
import globalContainersStore from 'src/stores/zun/containers';
import { checkItemAction } from 'resources/zun/container';
import { ImageStore } from 'stores/glance/image';

export class RebuildContainer extends ModalAction {
  static id = 'rebuild';

  static title = t('Rebuild Container');

  static buttonText = t('Rebuild');

  static policy = 'container:rebuild';

  aliasPolicy = 'zun:container:rebuild';

  static allowed = (item) => checkItemAction(item, 'rebuild');

  get name() {
    return t('Rebuild Container');
  }

  get isAsyncAction() {
    return true;
  }

  get defaultValue() {
    const { name, image, image_driver } = this.item;
    return {
      name,
      image,
      image_driver,
    };
  }

  get formItems() {
    return [
      {
        name: 'name',
        label: t('Container Name'),
        type: 'label',
      },
      {
        name: 'image',
        label: t('Image'),
        type: 'input',
        placeholder: t('Name or ID og the container image'),
        required: true,
        validator: (rule, value) => {
          return new ImageStore()
            .fetchDetail({ id: value })
            .then(() => {
              return Promise.resolve(true);
            })
            .catch(() => {
              return Promise.reject(new Error(t('The image is not existed')));
            });
        },
      },
      {
        name: 'image_driver',
        label: t('Image Driver'),
        placeholder: t('Image Driver'),
        type: 'select',
        options: [
          {
            label: t('Docker'),
            value: 'docker',
          },
          {
            label: t('Glance'),
            value: 'glance',
          },
        ],
        allowClear: true,
      },
    ];
  }

  onSubmit = (values) => {
    const { uuid } = this.item;
    const { name, ...rest } = values;
    return globalContainersStore.rebuild(uuid, rest);
  };
}

export default inject('rootStore')(observer(RebuildContainer));
