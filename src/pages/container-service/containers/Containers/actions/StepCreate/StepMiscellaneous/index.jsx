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

export class StepMiscellaneous extends Base {
  get title() {
    return t('Miscellaneous');
  }

  get name() {
    return t('Miscellaneous');
  }

  get formItems() {
    return [
      {
        name: 'workdir',
        label: t('Working Directory'),
        type: 'input',
        placeholder: t('The working directory for commands to run in'),
      },
      {
        name: 'environmentVariables',
        label: t('Environment Variables'),
        type: 'add-select',
        itemComponent: KeyValueInput,
        addText: t('Add Environment Variable'),
      },
      {
        name: 'interactive',
        label: t('Enable interactive mode'),
        type: 'check',
      },
      {
        type: 'divider',
      },
      {
        name: 'labels',
        label: t('Labels'),
        type: 'add-select',
        itemComponent: KeyValueInput,
        addText: t('Add Label'),
      },
      {
        type: 'divider',
      },
      {
        name: 'hints',
        label: t('Scheduler Hints'),
        type: 'add-select',
        itemComponent: KeyValueInput,
        addText: t('Add scheduler hints'),
      },
    ];
  }
}

export default inject('rootStore')(observer(StepMiscellaneous));
