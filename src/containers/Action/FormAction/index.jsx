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

import BaseForm from 'components/Form';
import { getPath } from 'utils/route-map';

export default class FormAction extends BaseForm {
  static id = 'formAction';

  static actionType = 'link';

  static title = 'form';

  static buttonType = 'primary';

  static isDanger = false;

  static path = '/';

  static policy = '';

  static aliasPolicy = '';

  static allowed() {
    return Promise.resolve();
  }

  get isAdminPage() {
    return this.props.isAdminPage || false;
  }

  getRouteName(routeName) {
    return this.isAdminPage ? `${routeName}Admin` : routeName;
  }

  getRoutePath(routeName, params = {}, query = {}) {
    const realName = this.getRouteName(routeName);
    return getPath({ key: realName, params, query });
  }
}
