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
import globalStaticRouteStore from 'stores/neutron/static-route';
import { ModalAction } from 'containers/Action';

export class Create extends ModalAction {
  static id = 'create';

  static title = t('Create Static Route');

  init() {
    this.store = globalStaticRouteStore;
  }

  get name() {
    return t('Create static route');
  }

  static policy = 'update_router';

  get defaultValue() {
    return {};
  }

  get messageHasItemName() {
    return false;
  }

  static allowed = () => Promise.resolve(true);

  get formItems() {
    return [
      {
        name: 'destination',
        label: t('Destination CIDR'),
        type: 'input',
        required: true,
      },
      {
        name: 'nexthop',
        label: t('Next Hop'),
        type: 'input',
        required: true,
      },
    ];
  }

  onSubmit = (values, containerProps) => {
    const { match: { params: { id } = {} } = {} } = containerProps;
    const routes = [values];
    return this.store.addStaticRoute({ id, routes });
  };
}

export default inject('rootStore')(observer(Create));
