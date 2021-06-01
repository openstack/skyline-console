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

import { ConfirmAction } from 'containers/Action';
import { isArray } from 'lodash';

export default class StopAction extends ConfirmAction {
  get id() {
    return 'stop';
  }

  get title() {
    return t('Stop');
  }

  policy = 'identity:update_project';

  confirmContext(data) {
    if (isArray(data)) {
      const names = data.map((it) => it.name);
      return t(`Confirm to stop ${names.join(', ')}?`);
    }
    return t(`Confirm to stop ${data.name}?`);
  }

  onSubmit = () => {
    return Promise.resolve();
  };
}
