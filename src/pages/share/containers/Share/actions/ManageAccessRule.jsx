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
import { getPath } from 'utils/route-map';
import { FormAction } from 'containers/Action';

export class ManageAccessRule extends FormAction {
  static id = 'manage-access-rule';

  static title = t('Manage Access Rule');

  static path = (item, containerProp) => {
    const { isAdminPage } = containerProp;
    const key = isAdminPage ? 'shareDetailAdmin' : 'shareDetail';
    const { id } = item;
    return getPath({ key, params: { id }, query: { tab: 'rule' } });
  };

  get listUrl() {
    return this.getRoutePath('share');
  }

  get name() {
    return t('Manage Access Rule');
  }

  static policy = 'share_access_rule:index';

  static allowed = (item) => Promise.resolve(item.isMine);
}

export default inject('rootStore')(observer(ManageAccessRule));
