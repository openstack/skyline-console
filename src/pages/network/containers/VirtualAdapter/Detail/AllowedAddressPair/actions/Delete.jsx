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
import _ from 'lodash';
import globalVirtualAdapterStore from 'stores/neutron/virtual-adapter';

export default class DeleteAction extends ConfirmAction {
  get id() {
    return 'delete';
  }

  get title() {
    return t('Delete Allowed Address Pair');
  }

  get buttonType() {
    return 'danger';
  }

  get buttonText() {
    return t('Delete');
  }

  get actionName() {
    return t('delete allowed address pair');
  }

  getItemName = (data) => data.ip_address;

  policy = 'update_port';

  allowedCheckFunc = (item) => {
    if (!item) {
      return true;
    }
    return this.isOwnerOrAdmin(item);
  };

  isOwnerOrAdmin() {
    // TODO: check owner
    return true;
  }

  onSubmit = async (data) => {
    const { allowed_address_pairs = [], id } = globalVirtualAdapterStore.detail;
    _.remove(
      allowed_address_pairs,
      (item) => item.ip_address === data.ip_address
    );
    return globalVirtualAdapterStore
      .update(
        { id },
        {
          allowed_address_pairs,
        }
      )
      .then((ret) => {
        globalVirtualAdapterStore.setDetail(ret.port);
      });
  };
}
