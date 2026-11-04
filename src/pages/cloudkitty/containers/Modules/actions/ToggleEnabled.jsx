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
import globalCloudKittyModuleStore from 'stores/cloudkitty/module';

export default class ToggleEnabledAction extends ConfirmAction {
  get id() {
    return 'toggle-module';
  }

  get title() {
    return this.isEnabled ? t('Disable Module') : t('Enable Module');
  }

  get buttonText() {
    return this.isEnabled ? t('Disable') : t('Enable');
  }

  get actionName() {
    return this.isEnabled ? t('disable module') : t('enable module');
  }

  get isEnabled() {
    return !!(this.item || {}).enabled;
  }

  policy = 'rating:update_module';

  onSubmit = () =>
    globalCloudKittyModuleStore.toggle(
      { id: this.item.id },
      !this.item.enabled
    );
}
