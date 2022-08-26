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
import { QosSpecStore } from 'stores/cinder/qos-spec';
import Base from 'containers/TabDetail';
import { consumerTypes } from 'resources/cinder/volume-type';
import ExtraSpec from './ExtraSpec';
import actionConfigs from '../actions';

export class Detail extends Base {
  get name() {
    return t('volume type qos');
  }

  get policy() {
    return 'volume_extension:qos_specs_manage:get';
  }

  get listUrl() {
    return this.getRoutePath('volumeType', null, { tab: 'qos' });
  }

  get actionConfigs() {
    return actionConfigs;
  }

  get detailData() {
    return this.store.detail.qos_specs;
  }

  get detailInfos() {
    return [
      {
        title: t('Name'),
        dataIndex: 'name',
      },
      {
        title: t('Consumer'),
        dataIndex: 'consumer',
        valueMap: consumerTypes,
      },
    ];
  }

  get tabs() {
    const tabs = [
      {
        title: t('Extra Specs'),
        key: 'ExtraSpec',
        component: ExtraSpec,
      },
    ];
    return tabs;
  }

  init() {
    this.store = new QosSpecStore();
  }
}

export default inject('rootStore')(observer(Detail));
