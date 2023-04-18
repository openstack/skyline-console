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
import { getRecordSetFormItem } from 'src/resources/dns/record';
import globalDNSRecordSetsStore from 'src/stores/designate/recordSets';
import { DNS_RECORD_TYPE } from 'src/utils/dns-rrtype';

export class Update extends ModalAction {
  init() {
    this.store = globalDNSRecordSetsStore;
    this.state = {
      ...this.state,
      nameExtra: `Exp: ${DNS_RECORD_TYPE[this.item.type].nameExtra}`,
      recordsExtra: `Exp: ${DNS_RECORD_TYPE[this.item.type].recordsExtra}`,
    };
  }

  static id = 'create-record-set';

  static title = t('Update Record Set');

  get name() {
    return t('Update Record Set');
  }

  static policy = 'get_images';

  static allowed() {
    return Promise.resolve(true);
  }

  get defaultValue() {
    const { ...values } = this.item;

    const recordsData = [];
    values.records.map((item, index) =>
      recordsData.push({ index, value: item })
    );

    return {
      type: values.type,
      name: values.name,
      description: values.description,
      ttl: values.ttl,
      records: recordsData,
    };
  }

  get formItems() {
    return getRecordSetFormItem(this, this.currentFormValue);
  }

  onSubmit = (values) => {
    const zone_id = this.item.zone_id;
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
