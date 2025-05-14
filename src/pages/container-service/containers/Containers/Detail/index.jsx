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
import globalContainersStore from 'src/stores/zun/containers';
import { containerStatus } from 'resources/zun/container';
import { checkPolicyRule } from 'resources/skyline/policy';
import actionConfigs from '../actions';
import BaseDetail from './BaseDetail';
import ActionLogs from './ActionLogs';
import Logs from './Logs';
import Console from './Console';

export class ContainerDetail extends Base {
  init() {
    this.store = globalContainersStore;
  }

  get name() {
    return t('Container Detail');
  }

  get listUrl() {
    return this.getRoutePath('zunContainers');
  }

  get policy() {
    return 'container:get_one';
  }

  get actionConfigs() {
    if (this.isAdminPage) {
      return actionConfigs.actionConfigsAdmin;
    }
    return actionConfigs.actionConfigs;
  }

  get detailInfos() {
    return [
      {
        title: t('Name'),
        dataIndex: 'name',
      },
      {
        title: t('Container Status'),
        dataIndex: 'status',
        valueMap: containerStatus,
      },
    ];
  }

  get showLogs() {
    const { status } = this.detailData || {};
    const acceptedStatus = ['Created', 'Running', 'Stopped', 'Paused'];
    return checkPolicyRule('container:logs') && acceptedStatus.includes(status);
  }

  get tabs() {
    const items = [
      {
        title: t('Detail'),
        key: 'general_info',
        component: BaseDetail,
      },
      {
        title: t('Action Logs'),
        key: 'action_logs',
        component: ActionLogs,
      },
    ];
    if (this.showLogs) {
      items.push({
        title: t('Console Logs'),
        key: 'logs',
        component: Logs,
      });
    }
    if (this.detailData.interactive === true) {
      items.push({
        title: t('Console'),
        key: 'console',
        component: Console,
      });
    }
    return items;
  }
}

export default inject('rootStore')(observer(ContainerDetail));
