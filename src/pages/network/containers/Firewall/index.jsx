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

import { observer, inject } from 'mobx-react';
import Base from 'containers/TabList';
import { firewallEndpoint } from 'client/client/constants';
import Firewall from './Firewall';
import Policy from './Policy';
import Rule from './Rule';

export class Detail extends Base {
  get name() {
    return t('firewalls');
  }

  get checkEndpoint() {
    return true;
  }

  get endpoint() {
    return firewallEndpoint();
  }

  get tabs() {
    const tabs = [
      {
        title: t('Firewalls'),
        key: 'firewalls',
        component: Firewall,
      },
      {
        title: t('Firewall Policies'),
        key: 'policies',
        component: Policy,
      },
      {
        title: t('Firewall Rules'),
        key: 'rules',
        component: Rule,
      },
    ];
    return tabs;
  }
}

export default inject('rootStore')(observer(Detail));
