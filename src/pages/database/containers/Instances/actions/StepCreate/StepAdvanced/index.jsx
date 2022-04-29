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
import globalInstancesStore from 'stores/trove/instances';

export class StepAdvanced extends Base {
  init() {
    this.getConfigurationGroups();
  }

  get title() {
    return t('Initialize Databases');
  }

  get name() {
    return 'Initialize Databases';
  }

  allowed = () => Promise.resolve();

  get configurationGroup() {
    return (globalInstancesStore.list.data || []).map((it) => ({
      label: it.name,
      value: it.id,
    }));
  }

  async getConfigurationGroups() {
    globalInstancesStore.listConfigurationGroup();
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
        name: 'configurationGroup',
        label: t('Configuration Group'),
        type: 'select',
        options: this.configurationGroup,
      },
    ];
  }
}

export default inject('rootStore')(observer(StepAdvanced));
