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

export class StepOthers extends Base {
  get title() {
    return t('Others');
  }

  get name() {
    return t('Others');
  }

  keyValueValidator = (rule, value) => {
    const ifHaveEmpty = (value || []).some((it) => {
      const { value: innerValue } = it;
      if (innerValue?.key && innerValue?.value) {
        return false;
      }
      return true;
    });
    if (ifHaveEmpty) {
      return Promise.reject(new Error(t('Please input key and value')));
    }
    return Promise.resolve();
  };

  get formItems() {
    return [
      {
        name: 'hostname',
        label: t('Hostname'),
        type: 'input',
        placeholder: t('The host name of this container'),
      },
      {
        name: 'runtime',
        label: t('Runtime'),
        type: 'input',
        placeholder: t('The container runtime tool to create container with'),
      },
      {
        name: 'command',
        label: t('CMD'),
        type: 'input',
        placeholder: t('A command that will be sent to the container'),
      },
      {
        name: 'entrypoint',
        label: t('ENTRYPOINT'),
        type: 'input',
        extra: t(
          'The entrypoint which overwrites the default ENTRYPOINT of the image'
        ),
      },
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
        validator: this.keyValueValidator,
      },
      {
        name: 'hints',
        label: t('Scheduler Hints'),
        type: 'add-select',
        itemComponent: KeyValueInput,
        addText: t('Add scheduler hints'),
        validator: this.keyValueValidator,
      },
      {
        name: 'labels',
        label: t('Labels'),
        type: 'add-select',
        itemComponent: KeyValueInput,
        addText: t('Add Label'),
        validator: this.keyValueValidator,
      },
    ];
  }
}

export default inject('rootStore')(observer(StepOthers));
