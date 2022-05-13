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
import globalServerStore from 'stores/nova/instance';
import { isActive, isIronicInstance } from 'resources/nova/instance';
import i18n from 'core/i18n';

const { getLocale } = i18n;

export default class Console extends ConfirmAction {
  get id() {
    return 'console';
  }

  get title() {
    return t('Jump to Console');
  }

  get buttonText() {
    return t('Console');
  }

  get actionName() {
    return t('jump to the console');
  }

  policy = 'os_compute_api:os-remote-consoles';

  confirmContext = () =>
    t(
      'Are you sure to jump directly to the console? The console will open in a new page later.'
    );

  allowedCheckFunc = (item) => {
    if (!item) {
      return true;
    }
    return isActive(item) && !isIronicInstance(item);
  };

  performErrorMsg = () => {
    const errorMsg = t('You are not allowed to jump to the console.');
    return errorMsg;
  };

  onSubmit = async () => {
    const { id } = this.item;
    const store = globalServerStore;
    let res;
    if (isIronicInstance(this.item)) {
      res = await store.getConsoleIronic({ id });
    } else {
      res = await store.getConsole({ id });
    }
    const { url } = res.remote_console;
    const selectedLang = getLocale();
    window.open(`${url}&language=${selectedLang}`);
  };
}
