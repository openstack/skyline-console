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
import {
  getImageColumns,
  getImageSystemTabs,
  getImageOS,
} from 'resources/glance/image';

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
    this.updateDefaultValue();
  }

  get imageList() {
    const { imageTab } = this.state;
    return (globalImageStore.list.data || [])
      .filter((it) => it.owner === this.currentProjectId)
      .filter((it) => getImageOS(it) === imageTab);
  }

  get imageColumns() {
    return getImageColumns(this);
  }

  get systemTabs() {
    const imageTabs = getImageSystemTabs();
    return imageTabs;
  }

  onImageTabChange = (value) => {
    this.setState({
      imageTab: value,
    });
  };

  get formItems() {
    return [
      {
        name: 'name',
        label: t('Container Name'),
        type: 'input',
        placeholder: t('Container Name'),
      },
      {
        name: 'images',
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
        tabs: this.systemTabs,
        defaultTabValue: this.systemTabs[0].value,
        onTabChange: this.onImageTabChange,
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
      {
        name: 'command',
        label: t('Command'),
        type: 'input',
        placeholder: t('A command that will be sent to the container'),
      },
    ];
  }
}

export default inject('rootStore')(observer(StepInfo));
