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

import { observer, inject } from 'mobx-react';
import Base from 'containers/List';
import globalHypervisorStore from 'stores/nova/hypervisor';
import {
  hypervisorColumns,
  hypervisorFilters,
} from 'resources/nova/hypervisor';

export class Hypervisors extends Base {
  init() {
    this.store = globalHypervisorStore;
  }

  get policy() {
    return 'os_compute_api:os-hypervisors:list';
  }

  get name() {
    return t('Hypervisors');
  }

  get hasTab() {
    return true;
  }

  get fetchDataByAllProjects() {
    return false;
  }

  get hideCustom() {
    return true;
  }

  getColumns = () => {
    const columns = [...hypervisorColumns];
    columns[0] = {
      title: t('ID/Name'),
      dataIndex: 'service_host',
      routeName: 'hypervisorDetailAdmin',
      isLink: true,
    };
    return columns;
  };

  get searchFilters() {
    return hypervisorFilters;
  }
}

export default inject('rootStore')(observer(Hypervisors));
