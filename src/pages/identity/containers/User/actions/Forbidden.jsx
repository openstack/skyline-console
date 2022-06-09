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
import globalUserStore from 'stores/keystone/user';

export default class ForbiddenAction extends ConfirmAction {
  get id() {
    return 'Forbidden';
  }

  get title() {
    return t('Forbidden User');
  }

  get buttonText() {
    return t('Forbidden');
  }

  get isDanger() {
    return true;
  }

  get actionName() {
    return t('Forbidden User');
  }

  policy = 'identity:update_user';

  allowedCheckFunc = (item) => {
    if (!item) {
      return true;
    }
    return this.isForbidden(item);
  };

  isForbidden(item) {
    if (!item.enabled) {
      return false;
    }
    return true;
  }

  confirmContext = (data) => {
    const name = isArray(data)
      ? data.map((it) => it.name).join(',')
      : data.name;
    return t(
      'Are you sure to forbidden user { name }? Forbidden the user will not allow login in ',
      { name }
    );
  };

  onSubmit = () => {
    const { id } = this.item;
    return globalUserStore.forbidden({ id });
  };
}
