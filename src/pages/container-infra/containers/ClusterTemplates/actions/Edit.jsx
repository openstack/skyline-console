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
import { getPath } from 'src/utils/route-map';
import { StepCreate as Base } from './StepCreate';

export class Edit extends Base {
  static id = 'update-cluster-template';

  static title = t('Edit');

  get name() {
    return t('Update Cluster Template');
  }

  get listUrl() {
    return this.getRoutePath('clusterTemplate');
  }

  static policy = 'clustertemplate:update';

  static path = (item) => {
    const key = 'containerInfraUpdateClusterTemplate';
    const { id } = item;
    return getPath({ key, params: { id } });
  };

  static allowed() {
    return Promise.resolve(true);
  }
}

export default inject('rootStore')(observer(Edit));
