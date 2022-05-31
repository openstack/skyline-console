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
import globalServiceStore from 'stores/cinder/service';

export default class Enable extends ConfirmAction {
  get id() {
    return 'enable';
  }

  get title() {
    return t('Enable Service');
  }

  get buttonText() {
    return t('Enable');
  }

  get actionName() {
    return t('enable cinder service');
  }

  getItemName = (data) => data.binary;

  policy = 'volume_extension:services:update';

  allowedCheckFunc = (item) => {
    if (!item) {
      return true;
    }
    return this.canEnable(item);
  };

  onSubmit = (item) => {
    const { host, binary } = item || this.item;
    const body = {
      host,
      binary,
    };
    return globalServiceStore.enable(body);
  };

  canEnable(item) {
    return item.status === 'disabled';
  }
}
