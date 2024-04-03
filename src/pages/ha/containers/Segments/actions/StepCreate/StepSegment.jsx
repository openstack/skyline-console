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
import Base from 'components/Form';

export class StepSegment extends Base {
  get title() {
    return 'StepSegment';
  }

  get name() {
    return 'StepSegment';
  }

  get isStep() {
    return true;
  }

  get defaultValue() {
    return {
      recovery_method: 'auto',
      service_type: 'compute',
    };
  }

  allowed = () => Promise.resolve();

  get formItems() {
    return [
      {
        name: 'segment_name',
        label: t('Segment Name'),
        type: 'input',
        required: true,
      },
      {
        name: 'recovery_method',
        label: t('Recovery Method'),
        type: 'select',
        options: [
          { label: t('auto'), value: 'auto' },
          { label: t('auto_priority'), value: 'auto_priority' },
          { label: t('reserved_host'), value: 'reserved_host' },
          { label: t('rh_priority'), value: 'rh_priority' },
        ],
        required: true,
      },
      {
        name: 'service_type',
        label: t('Service Type'),
        type: 'input',
        required: true,
        disabled: true,
      },
      {
        name: 'description',
        label: t('Description'),
        type: 'textarea',
        rows: 4,
      },
    ];
  }
}

export default inject('rootStore')(observer(StepSegment));
