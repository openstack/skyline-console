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
import globalContainersStore from 'src/stores/zun/containers';
import { checkItemAction } from 'resources/zun/container';

export default class UnpauseContainer extends ConfirmAction {
  get id() {
    return 'Unpause';
  }

  get title() {
    return t('Unpause Container');
  }

  get actionName() {
    return t('Unpause Container');
  }

  get buttonText() {
    return t('Unpause');
  }

  policy = 'container:unpause';

  aliasPolicy = 'zun:container:unpause';

  allowedCheckFunc = (item) => checkItemAction(item, 'unpause');

  onSubmit = (data) => globalContainersStore.unpause({ id: data.uuid });
}
