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
import { checkStatus } from 'resources/nova/instance';
import globalTroveInstanceStore from 'stores/trove/instances';

export default class StartAction extends ConfirmAction {
  get id() {
    return 'restart';
  }

  get title() {
    return t('Restart Database Service');
  }

  get isDanger() {
    return true;
  }

  get buttonText() {
    return t('Restart Database Service');
  }

  get actionName() {
    return t('Restart Database Service');
  }

  get isAsyncAction() {
    return true;
  }

  policy = 'instance:restart';

  allowedCheckFunc = (item) =>
    checkStatus(['active', 'shutoff', 'shutdown'], item);

  onSubmit = (item) => {
    const { id } = item || this.item;
    return globalTroveInstanceStore.restart({ id });
  };
}
