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

export default class PauseContainer extends ConfirmAction {
  get id() {
    return 'pause';
  }

  get title() {
    return t('Pause Container');
  }

  get actionName() {
    return t('Pause Container');
  }

  get buttonText() {
    return t('Pause');
  }

  policy = 'container:pause';

  aliasPolicy = 'zun:container:pause';

  allowedCheckFunc = (item) => checkItemAction(item, 'pause');

  onSubmit = (data) => globalContainersStore.pause({ id: data.uuid });
}
