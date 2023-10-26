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
import Base from 'containers/TabDetail';
import { DNSRecordSetsStore } from 'stores/designate/record-set';
import { RECORD_STATUS, getRecordSetType } from 'resources/dns/record';
import BaseDetail from './BaseDetail';
import actionConfigs from '../actions';

export class RecordSetsDetail extends Base {
  init() {
    this.store = new DNSRecordSetsStore();
  }

  get titleValue() {
    return this.detailData.id;
  }

  get name() {
    return t('Recordset Detail');
  }

  get listUrl() {
    return this.getRoutePath(
      'dnsZonesDetail',
      { id: this.detailData.zone_id },
      { tab: 'record_sets' }
    );
  }

  get actionConfigs() {
    return actionConfigs;
  }

  get policy() {
    return 'get_recordset';
  }

  get detailInfos() {
    return [
      {
        title: t('Name'),
        dataIndex: 'name',
      },
      {
        title: t('Description'),
        dataIndex: 'description',
      },
      {
        title: t('Type'),
        dataIndex: 'type',
        render: (data) => getRecordSetType(data),
      },
      {
        title: t('Status'),
        dataIndex: 'status',
        valueMap: RECORD_STATUS,
      },
    ];
  }

  get tabs() {
    const tabs = [
      {
        title: t('Overview'),
        key: 'overview',
        component: BaseDetail,
      },
    ];

    return tabs;
  }
}

export default inject('rootStore')(observer(RecordSetsDetail));
