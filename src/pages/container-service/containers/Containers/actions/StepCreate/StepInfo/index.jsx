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

import Base from 'components/Form';
import { inject, observer } from 'mobx-react';
import { ImageStore } from 'stores/glance/image';
import { getImageColumns } from 'resources/glance/image';
import { imageDrivers } from 'resources/zun/container';

export class StepInfo extends Base {
  init() {
    this.imageStore = new ImageStore();
  }

  get title() {
    return t('Info');
  }

  get name() {
    return t('Info');
  }

  get imageColumns() {
    return getImageColumns(this).filter(
      (it) => !['project_name', 'owner'].includes(it.dataIndex)
    );
  }

  get imageDriverOptions() {
    return Object.entries(imageDrivers).map(([k, v]) => ({
      label: v,
      value: k,
    }));
  }

  get formItems() {
    const { context: { image_driver } = {} } = this.props;

    return [
      {
        name: 'name',
        label: t('Container Name'),
        type: 'input',
        placeholder: t('Please input container name'),
        required: true,
        validator: (rule, value) => {
          const pattern = /^[a-zA-Z0-9][a-zA-Z0-9_.-]+$/;
          if (!pattern.test(value)) {
            return Promise.reject(
              value
                ? t(
                    'The name should start with letter or number, and be a string of 2 to 255, characters can only contain "0-9, a-z, A-Z, -, _, ."'
                  )
                : ''
            );
          }
          return Promise.resolve();
        },
      },
      {
        name: 'image_driver',
        label: t('Image Driver'),
        placeholder: t('Please select image driver'),
        type: 'select',
        options: this.imageDriverOptions,
        onChange: (value) =>
          this.updateContext({
            image_driver: value,
          }),
        required: true,
      },
      {
        name: 'imageDocker',
        label: t('Image'),
        type: 'input',
        placeholder: t('Please input image'),
        required: true,
        display: image_driver === 'docker',
      },
      {
        name: 'imageGlance',
        label: t('Image'),
        type: 'select-table',
        required: true,
        backendPageStore: this.imageStore,
        extraParams: { container_format: 'docker' },
        isLoading: this.imageStore.list.isLoading,
        filterParams: [
          {
            label: t('Name'),
            name: 'name',
          },
        ],
        columns: this.imageColumns,
        display: image_driver === 'glance',
      },
    ];
  }
}

export default inject('rootStore')(observer(StepInfo));
