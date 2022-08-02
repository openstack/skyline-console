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
import { VolumeTypeStore } from 'stores/cinder/volume-type';
import Base from 'containers/TabDetail';
import { isEmpty } from 'lodash';
import ExtraSpec from './ExtraSpec';
import BaseDetail from './BaseDetail';
import actionConfigs from '../actions';

export class Detail extends Base {
  get name() {
    return t('volume type');
  }

  get policy() {
    return 'volume_extension:type_get';
  }

  get listUrl() {
    return this.getRoutePath('volumeType');
  }

  get actionConfigs() {
    return actionConfigs;
  }

  get detailInfos() {
    return [
      {
        title: t('Name'),
        dataIndex: 'name',
      },
      {
        title: t('Description'),
        dataIndex: 'description',
      },
      {
        title: t('Public'),
        dataIndex: 'is_public',
        isHideable: true,
        valueRender: 'yesNo',
      },
      {
        title: t('QoS Spec ID'),
        dataIndex: 'qos_specs_id',
        valueRender: 'noValue',
      },
    ];
  }

  get tabs() {
    const { encryption } = this.detailData;
    const tabs = [
      {
        title: t('Extra Specs'),
        key: 'ExtraSpec',
        component: ExtraSpec,
      },
    ];
    if (!isEmpty(encryption)) {
      tabs.unshift({
        title: t('Detail'),
        key: 'baseDetail',
        component: BaseDetail,
      });
    }
    return tabs;
  }

  init() {
    this.store = new VolumeTypeStore();
  }
}

export default inject('rootStore')(observer(Detail));
