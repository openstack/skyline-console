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

import { inject, observer } from 'mobx-react';
import {
  instanceStatus,
  lockRender,
  isIronicInstance,
} from 'resources/nova/instance';
import { ServerStore } from 'stores/nova/instance';
import Base from 'containers/TabDetail';
import Volumes from 'pages/storage/containers/Volume';
import FloatingIps from 'pages/network/containers/FloatingIp';
import VirtualAdapter from 'pages/network/containers/Port';
import actionConfigsRecycleBin from 'pages/management/containers/RecycleBin/actions';
import { toJS } from 'mobx';
import BaseDetail from './BaseDetail';
import SecurityGroup from './SecurityGroup';
import ActionLog from './ActionLog';
import Snapshots from '../../InstanceSnapshot';
import actionConfigs from '../actions';
import Log from './Log';

export class InstanceDetail extends Base {
  get name() {
    return t('instance');
  }

  get enableCinder() {
    return this.props.rootStore.checkEndpoint('cinder');
  }

  get policy() {
    return 'os_compute_api:servers:show';
  }

  get isRecycleBinDetail() {
    return this.path.includes('recycle-bin');
  }

  get listUrl() {
    if (this.isRecycleBinDetail) {
      return this.getRoutePath('recycleBin');
    }
    return this.getRoutePath('instance');
  }

  get actionConfigs() {
    if (this.isRecycleBinDetail) {
      return actionConfigsRecycleBin;
    }
    return this.isAdminPage
      ? actionConfigs.adminActions
      : actionConfigs.actionConfigs;
  }

  get detailData() {
    const { id, status } = this.store.detail;
    if (id && status === 'soft_deleted' && !this.isRecycleBinDetail) {
      const path = this.getRoutePath('recycleBinDetail', { id });
      this.routing.push(path);
    }
    return toJS(this.store.detail) || {};
  }

  getActionData() {
    return this.detailData.itemInList || {};
  }

  updateFetchParams = (params) => ({
    ...params,
    isRecycleBinDetail: this.isRecycleBinDetail,
  });

  get detailInfos() {
    return [
      {
        title: t('Name'),
        dataIndex: 'name',
      },
      {
        title: t('Status'),
        dataIndex: 'status',
        valueMap: instanceStatus,
      },
      {
        title: t('Lock Status'),
        dataIndex: 'locked',
        render: lockRender,
      },
      {
        title: t('Project ID'),
        dataIndex: 'tenant_id',
        hidden: !this.isAdminPage,
      },
      {
        title: t('Created At'),
        dataIndex: 'created',
        valueRender: 'toLocalTime',
      },
      {
        title: t('Host'),
        dataIndex: 'OS-EXT-SRV-ATTR:host',
        // dataIndex: 'host',
      },
    ];
  }

  get tabs() {
    const tabs = [
      {
        title: t('Detail'),
        key: 'detail',
        component: BaseDetail,
      },
      {
        title: t('Instance Snapshots'),
        key: 'snapshots',
        component: Snapshots,
      },
      {
        title: t('Interfaces'),
        key: 'interface',
        component: VirtualAdapter,
      },
      {
        title: t('Floating IPs'),
        key: 'floatingIps',
        component: FloatingIps,
      },
      {
        title: t('Security Groups'),
        key: 'securityGroup',
        component: SecurityGroup,
      },
      {
        title: t('Action Logs'),
        key: 'action',
        component: ActionLog,
      },
      {
        title: t('Console Logs'),
        key: 'logs',
        component: Log,
      },
    ];
    if (this.enableCinder) {
      tabs.splice(1, 0, {
        title: t('Volumes'),
        key: 'volumes',
        component: Volumes,
      });
    }
    if (isIronicInstance(this.detailData)) {
      return tabs.filter(
        (it) =>
          it.key !== 'volumes' && it.key !== 'snapshots' && it.key !== 'monitor'
      );
    }
    return tabs;
  }

  init() {
    this.store = new ServerStore();
  }
}

export default inject('rootStore')(observer(InstanceDetail));
