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
import Base from 'containers/List';
import { CloudKittyHashMapThresholdStore } from 'stores/cloudkitty/hashmapThreshold';
import { mappingTypes, formatRate } from 'resources/cloudkitty/rating';
import { thresholdActionConfigs } from '../actions/thresholdActions';

export class Thresholds extends Base {
  init() {
    this.store = new CloudKittyHashMapThresholdStore();
    this.downloadStore = new CloudKittyHashMapThresholdStore();
  }

  // CloudKitty's hashmap endpoints take no `all_projects` argument and reject
  // it with a 400. The threshold list is already scoped by service_id, so
  // suppress the admin-page default that appends all_projects=true.
  get fetchDataByAllProjects() {
    return false;
  }

  get policy() {
    return 'rating:module_config';
  }

  get name() {
    return t('hashmap thresholds');
  }

  get id() {
    return this.params.id;
  }

  get hideSearch() {
    return true;
  }

  get actionConfigs() {
    return thresholdActionConfigs;
  }

  // Drop `all_projects` (injected by the admin TabDetail parent) and `tab`,
  // since CloudKitty's hashmap endpoints reject unknown arguments with a 400.
  updateFetchParams = (params) => {
    const { id, all_projects, tab, ...rest } = params;
    return {
      ...rest,
      service_id: id,
    };
  };

  getColumns = () => [
    {
      title: t('Threshold ID'),
      dataIndex: 'threshold_id',
    },
    {
      title: t('Level'),
      dataIndex: 'level',
    },
    {
      title: t('Type'),
      dataIndex: 'type',
      valueMap: mappingTypes,
    },
    {
      title: t('Cost'),
      dataIndex: 'cost',
      render: (value) => formatRate(value),
    },
    {
      title: t('Field'),
      dataIndex: 'field_id',
      render: (value) => value || '-',
      isHideable: true,
    },
  ];
}

export default inject('rootStore')(observer(Thresholds));
