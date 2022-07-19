// Copyright 2022 99cloud
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
import CreateInstance from 'pages/compute/containers/Instance/actions/StepCreate';

export class StepCreate extends CreateInstance {
  static id = 'instance-create';

  static title = t('Create Instance');

  static path(item) {
    return `/compute/instance/create?snapshot=${item.id}`;
  }

  static policy = 'os_compute_api:servers:create';

  static allowed(item) {
    return Promise.resolve(item.status === 'active');
  }
}

export default inject('rootStore')(observer(StepCreate));
