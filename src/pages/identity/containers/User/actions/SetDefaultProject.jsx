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
import { FormAction } from 'containers/Action';

export class SetDefaultProject extends FormAction {
  static id = 'set-default-project';

  static title = t('Set Default Project');

  static allowed() {
    return Promise.resolve(true);
  }

  static path = (item) => {
    return `/identity/user-admin/detail/${item.id}?tab=project`;
  };

  get name() {
    return t('Set Default Project');
  }
}

export default inject('rootStore')(observer(SetDefaultProject));
