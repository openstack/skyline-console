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

import { observer, inject } from 'mobx-react';
import Base from 'containers/List';
import globalVolumeTypeStore, {
  VolumeTypeStore,
} from 'stores/cinder/volume-type';
import { has } from 'lodash';
import { multiTip } from 'resources/cinder/volume';
import actionConfigs from './actions';

export class VolumeType extends Base {
  init() {
    this.store = globalVolumeTypeStore;
    this.downloadStore = new VolumeTypeStore();
  }

  get policy() {
    return 'volume_extension:type_get_all';
  }

  get name() {
    return t('volume types');
  }

  get isFilterByBackend() {
    return true;
  }

  get fetchDataByAllProjects() {
    return false;
  }

  get actionConfigs() {
    return actionConfigs;
  }

  get hasTab() {
    return true;
  }

  updateFetchParamsByPage = (params) => {
    const newParams = {
      ...params,
      showEncryption: true,
      showQoS: true,
    };
    if (has(params, 'is_public')) {
      return newParams;
    }
    return {
      ...newParams,
      is_public: 'None',
    };
  };

  getColumns = () => [
    {
      title: t('ID/Name'),
      dataIndex: 'name',
      routeName: 'volumeTypeDetailAdmin',
    },
    {
      title: t('Description'),
      dataIndex: 'description',
      isHideable: true,
      valueRender: 'noValue',
    },
    {
      title: t('Associated QoS Spec ID/Name'),
      dataIndex: 'qos_specs_name',
      isLink: true,
      routeName: 'volumeTypeQosDetailAdmin',
      idKey: 'qos_specs_id',
    },
    {
      title: t('Encryption'),
      dataIndex: 'encryption',
      isHideable: true,
      render: (value) => (value && value.provider) || '-',
    },
    {
      title: t('Public'),
      dataIndex: 'is_public',
      valueRender: 'yesNo',
    },
    {
      title: t('Shared'),
      dataIndex: 'multiattach',
      valueRender: 'yesNo',
      titleTip: multiTip,
      width: 120,
    },
  ];

  get searchFilters() {
    return [
      {
        label: t('Name'),
        name: 'name',
      },
      {
        label: t('Associated QoS Spec ID'),
        name: 'qos_specs_id',
      },
    ];
  }
}

export default inject('rootStore')(observer(VolumeType));
