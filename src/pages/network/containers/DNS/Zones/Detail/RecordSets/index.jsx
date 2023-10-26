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

import React from 'react';
import Base from 'containers/List';
import { inject, observer } from 'mobx-react';
import { Tag } from 'antd';
import globalDNSRecordSetsStore from 'stores/designate/record-set';
import { RECORD_STATUS, getRecordSetType } from 'resources/dns/record';
import actionConfigs from './actions';

export class RecordSets extends Base {
  init() {
    this.store = globalDNSRecordSetsStore;
  }

  get name() {
    return t('recordsets');
  }

  get policy() {
    return 'get_recordsets';
  }

  get actionConfigs() {
    return actionConfigs;
  }

  getColumns() {
    return [
      {
        title: t('ID/Name'),
        dataIndex: 'name',
        routeName: this.getRouteName('dnsRecordSetDetail'),
        routeParamsFunc: (data) => {
          return {
            id: data.zone_id,
            recordset_id: data.id,
          };
        },
        isLink: true,
      },
      {
        title: t('Type'),
        dataIndex: 'type',
        render: (value) => getRecordSetType(value),
      },
      {
        title: t('Records'),
        dataIndex: 'records',
        render: (value) => value.map((item) => <Tag key={item}>{item}</Tag>),
        stringify: (value) => value.join('\n'),
      },
      {
        title: t('Status'),
        dataIndex: 'status',
        valueMap: RECORD_STATUS,
      },
    ];
  }
}

export default inject('rootStore')(observer(RecordSets));
