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

import React from 'react';
import { inject, observer } from 'mobx-react';
import { Spin } from 'antd';
import { upperFirst } from 'lodash';
import memoize from 'lodash/memoize';
import cosImageStore from 'stores/cos/image';
import { FormAction } from 'containers/Action';
import { isOwner } from 'resources/glance/image';
import { isActive } from 'resources/nova/instance';
import { stringsToOptions } from 'utils/image';
import { osTitleMap } from 'src/utils/os';

export class Edit extends FormAction {
  init() {
    this.store = cosImageStore;

    const { id } = this.params;

    this.getImageMaterials().catch(console.error);

    if (id) {
      this.store.fetchDetail({ id }).then(() => {
        this.updateDefaultValue();
      });
    }
  }

  static id = 'image-edit';

  static title = t('Edit Image');

  static buttonText = t('Edit');

  static path = (item, containerProps) => {
    const { isAdminPage = false } = containerProps || {};
    const base = isAdminPage ? '/compute/image-admin' : '/compute/image';
    const id = item?.id || item?.imageId;
    return `${base}/edit/${id}`;
  };

  get listUrl() {
    return this.getRoutePath('image');
  }

  get name() {
    return t('edit image');
  }

  get enableCinder() {
    return this.props.rootStore.checkEndpoint('cinder');
  }

  get labelCol() {
    return {
      xs: { span: 6 },
      sm: { span: 5 },
    };
  }

  get defaultValue() {
    const {
      imageName = '',
      imageProject = '',
      imageOS = '',
      imageDestination = '',
      imageDomain = '',
      imageVisibility,
    } = this.store.detail || {};

    const osKey = typeof imageOS === 'string' ? imageOS.toLowerCase() : '';
    const osLabel = osKey ? osTitleMap[osKey] : undefined;

    return {
      name: imageName,
      project: imageProject,
      os: osLabel,
      destination: imageDestination,
      domain: imageDomain ? upperFirst(imageDomain) : '',
      visibility: imageVisibility,
    };
  }

  async getImageMaterials() {
    await this.store.fetchImageMaterials();
  }

  computeImageMaterials = memoize((materials) => {
    const { oses = [], visibilities = [] } = materials || {};

    return {
      oses: stringsToOptions(oses),
      visibilities: stringsToOptions(visibilities),
    };
  });

  get imageMaterials() {
    return this.computeImageMaterials(this.store.imageMaterials);
  }

  get isImageMaterialsLoading() {
    return this.store.isImageMaterialsLoading;
  }

  get isDetailLoading() {
    return this.store.isLoading;
  }

  get isPageLoading() {
    return this.isImageMaterialsLoading || this.isDetailLoading;
  }

  static policy = 'modify_image';

  static allowed = (item, containerProps) => {
    const { isAdminPage } = containerProps;
    return Promise.resolve((isActive(item) && isOwner(item)) || isAdminPage);
  };

  get formItems() {
    return [
      {
        name: 'name',
        label: t('Specify Image Name'),
        type: 'input-name',
        isImage: true,
        required: true,
      },
      {
        name: 'project',
        label: t('Owned Project'),
        type: 'input',
        required: this.isAdminPage,
        hidden: !this.isAdminPage,
        disabled: true,
      },
      {
        name: 'os',
        label: t('OS'),
        type: 'select',
        required: true,
        options: this.imageMaterials?.oses || [],
        isLoading: this.isImageMaterialsLoading,
      },
      {
        name: 'destination',
        label: t('Destination'),
        type: 'input',
        required: true,
        disabled: true,
      },
      {
        name: 'domain',
        label: t('Domain'),
        type: 'input',
        required: true,
        disabled: true,
      },
      {
        name: 'visibility',
        label: t('Visibility'),
        type: 'radio',
        optionType: 'default',
        options: this.imageMaterials?.visibilities || [],
        required: true,
      },
    ];
  }

  onSubmit = (values) => {
    console.log('values', values);
    // TODO: implement edit image
  };

  render() {
    // Show loading spinner while data is being fetched
    if (this.isPageLoading) {
      return (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
        </div>
      );
    }

    return super.render();
  }
}

export default inject('rootStore')(observer(Edit));
