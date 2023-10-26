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

import { ModalAction } from 'containers/Action';
import { inject, observer } from 'mobx-react';
import { getRecordSetFormItem, DNS_RECORD_TYPE } from 'resources/dns/record';
import globalDNSRecordSetsStore from 'stores/designate/record-set';

export class Update extends ModalAction {
  init() {
    this.store = globalDNSRecordSetsStore;
    this.state = {
      ...this.state,
      nameExtra: `${t('Exp: ')}${DNS_RECORD_TYPE[this.item.type].nameExtra}`,
      recordsExtra: `${t('Exp: ')}${
        DNS_RECORD_TYPE[this.item.type].recordsExtra
      }`,
    };
  }

  static id = 'create-record-set';

  static title = t('Update Record Set');

  static buttonText = t('Update');

  get name() {
    return t('Update Record Set');
  }

  static policy = 'update_recordset';

  static allowed() {
    return Promise.resolve(true);
  }

  get defaultValue() {
    const { records, type, name, description, ttl } = this.item;
    const recordsData = records.map((item, index) => ({ index, value: item }));

    return {
      type,
      name,
      description,
      ttl,
      records: recordsData,
    };
  }

  get formItems() {
    const formItems = getRecordSetFormItem(this, this.currentFormValue);
    const newItems = formItems.map((it) => {
      if (it.name === 'name' || it.name === 'type') {
        return {
          ...it,
          disabled: true,
        };
      }
      return it;
    });
    return newItems;
  }

  onSubmit = (values) => {
    const { zone_id } = this.item;
    const recordset_id = this.item.id;

    const { records, ...val } = values;

    const recordsItem = [];
    records.forEach((item) => {
      recordsItem.push(item.value);
    });

    const body = {
      records: recordsItem,
      ...val,
    };

    return this.store.update(zone_id, recordset_id, body);
  };
}

export default inject('rootStore')(observer(Update));
