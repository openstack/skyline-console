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
import Base from 'containers/BaseDetail';
import { rollbackTip } from 'resources/heat/stack';

export class BaseDetail extends Base {
  get leftCards() {
    return [this.startCard, this.outputCard];
  }

  get rightCards() {
    return [this.paramCard];
  }

  get outputCard() {
    const { outputs = {} } = this.detailData;
    const options = outputs.map((it) => {
      const { output_key: key, output_value: value, description } = it;
      return {
        label: key,
        dataIndex: key,
        copyable: false,
        render: () => (
          <div>
            <div>{value}</div>
            <div>{description}</div>
          </div>
        ),
      };
    });
    return {
      title: t('Outputs'),
      options,
    };
  }

  get paramCard() {
    const { parameters = {} } = this.detailData;
    const options = Object.keys(parameters).map((key) => {
      return {
        label: key,
        dataIndex: key,
        render: () => parameters[key],
      };
    });
    return {
      title: t('Deployment Parameters'),
      options,
    };
  }

  get startCard() {
    const options = [
      {
        label: t('Timeout(Minute)'),
        dataIndex: 'timeout_mins',
      },
      {
        label: t('Fail Rollback'),
        dataIndex: 'disable_rollback',
        tooltip: rollbackTip,
        render: (value) => (value ? t('Disable') : t('Enable')),
      },
    ];
    return {
      title: t('Startup Parameters'),
      options,
    };
  }
}

export default inject('rootStore')(observer(BaseDetail));
