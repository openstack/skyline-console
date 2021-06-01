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
import globalRouterStore from 'stores/neutron/router';

export default class DisassociateFip extends ConfirmAction {
  get id() {
    return 'DisassociateFip';
  }

  get title() {
    return t('Disassociate Floating Ip');
  }

  get actionName() {
    return t('disassociate floating ip');
  }

  policy = 'update_router';

  canDisassociate = (item) => {
    const { external_gateway_info = {} } = item;
    const { external_fixed_ips = [] } = external_gateway_info || {};
    return external_fixed_ips.length > 0;
  };

  allowedCheckFunc = (item) => {
    if (!item) {
      return true;
    }
    return this.canDisassociate(item);
  };

  onSubmit = (data) => {
    const { id } = data;
    return globalRouterStore.disassociateFip({ id, router: data });
  };
}
