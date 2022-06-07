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

import { action, extendObservable } from 'mobx';
import client from 'client';
import Base from 'stores/base';
import globalRootStore from 'stores/root';

export class ServerStore extends Base {
  constructor() {
    super();
    extendObservable(this, {
      virtualResource: {},
      virtualResourceLoading: true,
    });
  }

  get client() {
    return client.nova.servers;
  }

  @action
  async getVirtualResourceOverview() {
    this.virtualResourceLoading = true;
    const promiseArray = [
      this.requestListAllByLimit({ all_tenants: true }, 1000),
      this.requestListAllByLimit({ all_tenants: true, status: 'ACTIVE' }, 1000),
      this.requestListAllByLimit({ all_tenants: true, status: 'ERROR' }, 1000),
      this.requestListAllByLimit(
        { all_tenants: true, status: 'SHUTOFF' },
        1000
      ),
    ];
    if (globalRootStore.checkEndpoint('cinder')) {
      const volumeResource = [
        client.skyline.extension.volumes({ limit: 10, all_projects: true }),
        client.skyline.extension.volumes({
          limit: 10,
          all_projects: true,
          status: 'in-use',
        }),
        client.skyline.extension.volumes({
          limit: 10,
          all_projects: true,
          status: 'error',
        }),
        client.skyline.extension.volumes({
          limit: 10,
          all_projects: true,
          status: 'available',
        }),
      ];
      promiseArray.push(...volumeResource);
    }
    const [
      allServers,
      activeServers,
      errorServers,
      shutoffServers,
      allVolumes,
      attachVolumes,
      errorVolumes,
      availableVolumes,
    ] = await Promise.all(promiseArray);
    const allServersCount = allServers.length;
    const activeServersCount = activeServers.length;
    const errorServersCount = errorServers.length;
    const shutoffServersCount = shutoffServers.length;
    const serviceNum = {
      all: allServersCount,
      active: activeServersCount,
      error: errorServersCount,
      shutoff: shutoffServersCount,
      other:
        allServersCount -
        (activeServersCount + errorServersCount + shutoffServersCount),
    };
    this.virtualResource = { serviceNum };
    if (globalRootStore.checkEndpoint('cinder')) {
      const { count: allVolumesCount } = allVolumes;
      const { count: attachVolumesCount } = attachVolumes;
      const { count: errorVolumesCount } = errorVolumes;
      const { count: availableVolumesCount } = availableVolumes;
      const volumeNum = {
        all: allVolumesCount,
        active: attachVolumesCount,
        error: errorVolumesCount,
        available: availableVolumesCount,
        other:
          allVolumesCount -
          (attachVolumesCount + errorVolumesCount + availableVolumesCount),
      };
      this.virtualResource.volumeNum = volumeNum;
    }
    this.virtualResourceLoading = false;
  }
}

const globalServerStore = new ServerStore();
export default globalServerStore;
