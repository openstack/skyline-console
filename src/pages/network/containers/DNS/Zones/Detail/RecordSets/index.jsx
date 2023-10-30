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
import { DNSRecordSetsStore } from 'stores/designate/record-set';
import {
  RECORD_STATUS,
  dnsRRTypeList,
  getRecordSetType,
} from 'resources/dns/record';
import { getOptions } from 'utils';
import actionConfigs from './actions';

export class RecordSets extends Base {
  init() {
    this.store = new DNSRecordSetsStore();
    this.downloadStore = new DNSRecordSetsStore();
  }

  get name() {
    return t('recordsets');
  }

  get policy() {
    return 'get_recordsets';
  }

  get isFilterByBackend() {
    return true;
  }

  get isSortByBackend() {
    return true;
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
            zoneId: data.zone_id,
            id: data.id,
          };
        },
        isLink: true,
        sortKey: 'id',
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
        sorter: false,
      },
      {
        title: t('Status'),
        dataIndex: 'status',
        valueMap: RECORD_STATUS,
        sorter: false,
      },
      {
        title: t('Created At'),
        dataIndex: 'created_at',
        valueRender: 'toLocalTime',
      },
    ];
  }

  get searchFilters() {
    return [
      {
        label: t('Name'),
        name: 'name',
      },
      {
        label: t('Type'),
        name: 'type',
        options: dnsRRTypeList(),
      },
      {
        label: t('Status'),
        name: 'status',
        options: getOptions(RECORD_STATUS),
      },
    ];
  }
}

export default inject('rootStore')(observer(RecordSets));
