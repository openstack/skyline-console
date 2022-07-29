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
import { SecretsStore } from 'stores/barbican/secrets';
import { getCertificateColumns } from 'resources/octavia/lb';
import BaseDetail from './BaseDetail';
import actionConfigs from '../../actions';

export class Detail extends Base {
  init() {
    this.store = new SecretsStore();
  }

  get policy() {
    return 'secret:get';
  }

  get name() {
    return 'Certificate Detail';
  }

  get listUrl() {
    return this.getRoutePath('certificate', null, { tab: 'CA' });
  }

  get actionConfigs() {
    return actionConfigs.actionConfigsSecret;
  }

  get detailInfos() {
    return getCertificateColumns(this).filter(
      (it) => it.dataIndex !== 'domain'
    );
  }

  get tabs() {
    return [
      {
        title: t('Detail Info'),
        key: 'detail_info',
        component: BaseDetail,
      },
    ];
  }
}

export default inject('rootStore')(observer(Detail));
