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

import Base from 'containers/BaseDetail';
import { inject, observer } from 'mobx-react';

export class BaseDetail extends Base {
  get leftCards() {
    const cards = [this.containersInfoCard, this.systemInfoCard];
    return cards;
  }

  get containersInfoCard() {
    const options = [
      {
        label: t('Total Containers'),
        dataIndex: 'total_containers',
      },
    ];

    return {
      title: t('Containers Info'),
      options,
    };
  }

  get systemInfoCard() {
    const options = [
      {
        label: t('Architecture'),
        dataIndex: 'architecture',
      },
      {
        label: t('Kernel Version'),
        dataIndex: 'kernel_version',
      },
      {
        label: t('OS'),
        dataIndex: 'os',
      },
      {
        label: t('OS Type'),
        dataIndex: 'os_type',
      },
    ];

    return {
      title: t('System Info'),
      options,
    };
  }
}

export default inject('rootStore')(observer(BaseDetail));
