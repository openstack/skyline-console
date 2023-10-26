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

import { ModalAction } from 'containers/Action';
import { inject, observer } from 'mobx-react';
import globalDNSRecordSetsStore from 'stores/designate/record-set';
import { getRecordSetFormItem, DNS_RECORD_TYPE } from 'resources/dns/record';

export class Create extends ModalAction {
  init() {
    this.store = globalDNSRecordSetsStore;
    this.state = {
      ...this.state,
      nameExtra: `${t('Exp: ')}${DNS_RECORD_TYPE.A.nameExtra}`,
      recordsExtra: `${t('Exp: ')}${DNS_RECORD_TYPE.A.recordsExtra}`,
    };
  }

  static id = 'create-record-set';

  static title = t('Create Record Set');

  get name() {
    return t('Create Record Set');
  }

  static policy = 'create_recordset';

  static allowed() {
    return Promise.resolve(true);
  }

  get defaultValue() {
    return {
      ttl: 3600,
      type: 'A',
    };
  }

  get formItems() {
    return getRecordSetFormItem(this, this.currentFormValue);
  }

  onSubmit = (values) => {
    const { detail } = this.containerProps;
    const { id } = detail || this.item;
    const { records, ...val } = values;

    const recordsItem = [];
    records.forEach((item) => {
      recordsItem.push(item.value);
    });

    const body = {
      records: recordsItem,
      ...val,
    };

    return this.store.create({ id }, body);
  };
}

export default inject('rootStore')(observer(Create));
