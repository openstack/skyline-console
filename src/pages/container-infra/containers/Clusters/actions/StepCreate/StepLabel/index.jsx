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

import Base from 'components/Form';
import { inject, observer } from 'mobx-react';
import KeyValueInput from 'components/FormItem/KeyValueInput';

export class StepLabel extends Base {
  get title() {
    return t('Labels');
  }

  get name() {
    return t('Labels');
  }

  get defaultValue() {
    const values = {};
    const { context: { clusterTemplate = {} } = {} } = this.props;
    const { selectedRows = [] } = clusterTemplate;
    const { labels = {} } = selectedRows[0] || {};
    values.additionalLabels = Object.keys(labels || {}).map((key) => ({
      value: {
        key,
        value: labels[key],
      },
    }));
    return values;
  }

  get formItems() {
    return [
      {
        name: 'additionalLabels',
        label: t('Additional Labels'),
        type: 'add-select',
        itemComponent: KeyValueInput,
        addText: t('Add Label'),
        onChange: (value) => {
          this.updateContext({
            additionalLabels: value,
          });
        },
      },
    ];
  }
}

export default inject('rootStore')(observer(StepLabel));
