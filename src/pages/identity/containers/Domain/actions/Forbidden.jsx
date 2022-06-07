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
import globalDomainStore from 'stores/keystone/domain';

export default class ForbiddenAction extends ConfirmAction {
  get id() {
    return 'Forbidden';
  }

  get title() {
    return t('Forbidden Domain');
  }

  get buttonText() {
    return t('Forbidden');
  }

  get actionName() {
    return t('Forbidden Domain');
  }

  get isDanger() {
    return true;
  }

  policy = 'identity:update_domain';

  allowedCheckFunc = (item) => {
    if (!item) {
      return true;
    }
    return this.isForbidden(item);
  };

  isForbidden(item) {
    if (item.enabled === false) {
      return false;
    }
    return true;
  }

  confirmContext = (data) => {
    const name = isArray(data)
      ? data.map((it) => it.name).join(',')
      : data.name;
    return t(
      'Are you sure to forbidden domain { name }? Forbidden the domain will have negative effect, and users associated with the domain will not be able to log in if they are only assigned to the domain',
      { name }
    );
  };

  onSubmit = () => {
    const { id } = this.item;
    return globalDomainStore.forbidden({ id });
  };
}
