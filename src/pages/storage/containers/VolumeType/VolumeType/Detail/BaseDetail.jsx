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
import Base from 'containers/BaseDetail';
import { controls } from 'resources/cinder/volume-type';

export class BaseDetail extends Base {
  get leftCards() {
    return [this.encryptionInfo];
  }

  get encryptionInfo() {
    const options = [
      {
        label: t('Provider'),
        dataIndex: 'encryption.provider',
      },
      {
        label: t('Control Location'),
        dataIndex: 'encryption.control_location',
        valueMap: controls,
      },
      {
        label: t('Cipher'),
        dataIndex: 'encryption.cipher',
      },
      {
        label: t('Key Size (bits)'),
        dataIndex: 'encryption.key_size',
      },
      {
        label: t('Created At'),
        dataIndex: 'encryption.created_at',
        valueRender: 'toLocalTime',
      },
    ];
    return {
      title: t('Encryption Info'),
      options,
    };
  }
}

export default inject('rootStore')(observer(BaseDetail));
