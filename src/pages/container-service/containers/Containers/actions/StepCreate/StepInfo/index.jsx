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
import globalImageStore from 'src/stores/glance/image';
import { getImageColumns } from 'resources/glance/image';
import { toJS } from 'mobx';

export class StepInfo extends Base {
  init() {
    this.getImageList();
  }

  get title() {
    return t('Info');
  }

  get name() {
    return t('Info');
  }

  async getImageList() {
    await globalImageStore.fetchList();
  }

  get imageList() {
    return toJS(globalImageStore.list.data || []).filter(
      (it) => it.container_format === 'docker'
    );
  }

  get imageColumns() {
    return getImageColumns(this).filter(
      (it) => !['project_name', 'owner'].includes(it.dataIndex)
    );
  }

  get formItems() {
    const { imageDriver } = this.state;

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
                    'The name should start with letter or number, characters can only contain "0-9, a-z, A-Z, -, _, ."'
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
        options: [
          {
            label: t('Docker Hub'),
            value: 'docker',
          },
          {
            label: t('Glance Image'),
            value: 'glance',
          },
        ],
        onChange: (value) => {
          this.setState({
            imageDriver: value,
          });
        },
        required: true,
      },
      {
        name: 'image',
        label: t('Image'),
        type: 'input',
        placeholder: t('Please input image'),
        required: true,
        display: imageDriver === 'docker',
      },
      {
        name: 'image',
        label: t('Image'),
        type: 'select-table',
        data: this.imageList,
        required: true,
        isLoading: globalImageStore.list.isLoading,
        filterParams: [
          {
            label: t('Name'),
            name: 'name',
          },
        ],
        columns: this.imageColumns,
        display: imageDriver === 'glance',
      },
    ];
  }
}

export default inject('rootStore')(observer(StepInfo));
