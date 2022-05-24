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
import Base from 'components/Form';
import { getPasswordOtherRule } from 'utils/validate';

export class StepInitializeDatabases extends Base {
  get title() {
    return t('Initialize Databases');
  }

  get name() {
    return 'Initialize Databases';
  }

  allowed = () => Promise.resolve();

  get defaultValue() {
    const values = {
      project: this.currentProjectName,
    };
    return values;
  }

  get formItems() {
    return [
      {
        name: 'project',
        label: t('Project'),
        type: 'label',
      },
      {
        type: 'divider',
      },
      {
        name: 'initialDatabases',
        label: t('Initial Databases'),
        type: 'input-name',
        required: true,
        maxLength: 64,
        isDatabaseName: true,
      },
      {
        name: 'initialAdminUser',
        label: t('Initial Admin User'),
        type: 'input-name',
        required: true,
        maxLength: 16,
        isDatabaseUserName: true,
      },
      {
        name: 'password',
        label: t('Password'),
        type: 'input-password',
        required: true,
        otherRule: getPasswordOtherRule('password'),
      },
      {
        name: 'confirmPassword',
        label: t('Confirm Password'),
        type: 'input-password',
        required: true,
        dependencies: ['password'],
        otherRule: getPasswordOtherRule('confirmPassword'),
      },
    ];
  }
}

export default inject('rootStore')(observer(StepInitializeDatabases));
