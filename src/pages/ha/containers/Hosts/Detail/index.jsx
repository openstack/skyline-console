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

import { parse } from 'qs';
import { inject, observer } from 'mobx-react';
import Base from 'containers/TabDetail';
import globalHostStore from 'src/stores/masakari/hosts';
import BaseDetail from './BaseDetail';
import actionConfigs from '../actions';

export class HostsDetail extends Base {
  init() {
    this.store = globalHostStore;
  }

  get name() {
    return t('Host Detail');
  }

  get listUrl() {
    return this.getRoutePath('masakariHosts');
  }

  get policy() {
    return 'capsule:get_one_all_projects';
  }

  get actionConfigs() {
    return actionConfigs;
  }

  get titleValue() {
    return parse(this.routing.location.search.slice(1)).uuid;
  }

  get detailInfos() {
    return [
      {
        title: t('Name'),
        dataIndex: 'name',
      },
    ];
  }

  updateFetchParams = (params) => {
    const hostId = parse(this.routing.location.search.slice(1));
    return {
      id: params.id,
      uuid: hostId.uuid,
    };
  };

  get tabs() {
    return [
      {
        title: t('Detail'),
        key: 'general_info',
        component: BaseDetail,
      },
    ];
  }
}

export default inject('rootStore')(observer(HostsDetail));
