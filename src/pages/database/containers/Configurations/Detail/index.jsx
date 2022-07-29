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
import Base from 'containers/TabDetail';
import globalConfigurationsStore from 'stores/trove/configurations';
import BaseDetail from './BaseDetail';
import Values from './Values';
import Instances from './Instances';

export class ConfigurationsDetail extends Base {
  init() {
    this.store = globalConfigurationsStore;
  }

  get name() {
    return 'Configurations Detail';
  }

  get listUrl() {
    return this.getRoutePath('configurations');
  }

  get policy() {
    return 'configuration:show';
  }

  get detailInfos() {
    return [
      {
        title: t('Name'),
        dataIndex: 'name',
      },
    ];
  }

  get tabs() {
    return [
      {
        title: t('Detail'),
        key: 'general_info',
        component: BaseDetail,
      },
      {
        title: t('Values'),
        key: 'values',
        component: Values,
      },
      {
        title: t('Instances'),
        key: 'instances',
        component: Instances,
      },
    ];
  }
}

export default inject('rootStore')(observer(ConfigurationsDetail));
