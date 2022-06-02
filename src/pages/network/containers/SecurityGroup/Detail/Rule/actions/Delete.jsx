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
import globalSecurityGroupRuleStore from 'stores/neutron/security-rule';

export default class DeleteAction extends ConfirmAction {
  get id() {
    return 'delete';
  }

  get title() {
    return t('Delete Rule');
  }

  get isDanger() {
    return true;
  }

  get buttonText() {
    return t('Delete');
  }

  get actionName() {
    return t('Delete Rule');
  }

  policy = 'delete_security_group_rule';

  getItemName = (item) => {
    if (item.name) {
      return item.name;
    }

    const {
      ethertype,
      port_range_min,
      port_range_max,
      protocol,
      remote_group_id,
      remote_ip_prefix,
    } = item;
    let remote;
    let protoPort = '';
    const prMinNum = parseInt(port_range_min, 10);
    const prMaxNum = parseInt(port_range_max, 10);
    const prProtocol = protocol.toLowerCase();
    if (prMinNum) {
      protoPort =
        prMinNum === prMaxNum
          ? `${prMinNum} / ${prProtocol}`
          : `${prMinNum} - ${prMaxNum} / ${prProtocol}`;
    }
    const direction = item.direction === 'egress' ? 'to' : 'from';
    if (remote_group_id) {
      remote = remote_group_id;
    } else {
      remote = remote_ip_prefix || t('ANY');
    }
    return `ALLOW ${ethertype} ${protoPort} ${direction} ${remote}`;
  };

  onSubmit = (data) => globalSecurityGroupRuleStore.delete(data);
}
