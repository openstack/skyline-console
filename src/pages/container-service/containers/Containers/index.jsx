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

import React from 'react';
import Base from 'containers/List';
import { inject, observer } from 'mobx-react';
import globalContainersStore from 'src/stores/zun/containers';
import {
  containerStatus,
  containerTaskStatus,
  imageDrivers,
} from 'resources/zun/container';
import { getOptions } from 'utils';
import actionConfigs from './actions';

export class Containers extends Base {
  init() {
    this.store = globalContainersStore;
    this.downloadStore = globalContainersStore;
  }

  get name() {
    return t('containers');
  }

  get policy() {
    return 'container:get_all';
  }

  get actionConfigs() {
    if (this.isAdminPage) {
      return actionConfigs.actionConfigsAdmin;
    }
    return actionConfigs.actionConfigs;
  }

  getColumns() {
    return [
      {
        title: t('ID/Name'),
        dataIndex: 'name',
        isLink: true,
        routeName: this.getRouteName('zunContainerDetail'),
        idKey: 'uuid',
      },
      {
        title: t('Image Driver'),
        isHideable: true,
        dataIndex: 'image_driver',
        valueMap: imageDrivers,
      },
      {
        title: t('IP Address'),
        isHideable: true,
        dataIndex: 'addrs',
        render: (value = []) => (
          <>
            {value.length
              ? value.map((it) => {
                  return <div key={it.addr}>{it.addr}</div>;
                })
              : '-'}
          </>
        ),
        stringify: (value = []) => value.map((it) => it.addr).join(','),
      },
      {
        title: t('Ports'),
        isHideable: true,
        dataIndex: 'ports',
        render: (value = []) => (
          <>
            {value.length
              ? value.map((it) => {
                  return <div key={it}>{it}</div>;
                })
              : '-'}
          </>
        ),
      },
      {
        title: t('Networks'),
        isHideable: true,
        dataIndex: 'networks',
        render: (value = []) => (
          <>
            {value.length
              ? value.map((it) => {
                  const link = this.getLinkRender('networkDetail', it.name, {
                    id: it.id,
                  });
                  return <div key={it.id}>{link}</div>;
                })
              : '-'}
          </>
        ),
      },
      {
        title: t('Container Status'),
        isHideable: true,
        dataIndex: 'status',
        valueMap: containerStatus,
      },
      {
        title: t('Task State'),
        isHideable: true,
        dataIndex: 'task_state',
        valueMap: containerTaskStatus,
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
        label: t('Image Driver'),
        name: 'image_driver',
        options: getOptions(imageDrivers),
      },
      {
        label: t('Container Status'),
        name: 'status',
        options: getOptions(containerStatus),
      },
      {
        label: t('Task State'),
        name: 'task_state',
        options: getOptions(containerTaskStatus),
      },
    ];
  }
}

export default inject('rootStore')(observer(Containers));
