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

import { extendObservable, action } from 'mobx';
import client from 'client';

export default class OverviewStore {
  constructor() {
    this.reset(true);
  }

  get initValue() {
    return {
      projectInfoLoading: true,
      computeServiceLoading: true,
      networkServiceLoading: true,
      virtualResourceLoading: true,
      computeService: [],
      networkService: [],
      virtualResource: {},
      platformNum: {
        projectNum: 0,
        userNum: 0,
        nodeNum: 0,
      },
    };
  }

  @action
  reset(init) {
    const state = this.initValue;

    if (init) {
      extendObservable(this, state);
    } else {
      Object.keys(state).forEach((key) => {
        this[key] = state[key];
      });
    }
  }

  @action
  async getProjectInfoData() {
    this.projectInfoLoading = true;
    const promiseArray = [
      client.keystone.projects.list(),
      client.keystone.users.list(),
      client.nova.services.list({ binary: 'nova-compute' }),
    ];
    const [projectsResult, userResult, hostResult] = await Promise.all(
      promiseArray
    );
    const { projects = [] } = projectsResult;
    const { users = [] } = userResult;
    const { services = [] } = hostResult;
    this.platformNum.projectNum = projects.length;
    this.platformNum.userNum = users.length;
    this.platformNum.nodeNum = services.length;
    this.projectInfoLoading = false;
  }

  @action
  async getVirtualResource() {
    this.virtualResourceLoading = true;
    const promiseArray = [
      client.skyline.extension.servers({ limit: 10, all_projects: true }),
      client.skyline.extension.servers({
        limit: 10,
        all_projects: true,
        status: 'ACTIVE',
      }),
      client.skyline.extension.servers({
        limit: 10,
        all_projects: true,
        status: 'ERROR',
      }),
      client.skyline.extension.servers({
        limit: 10,
        all_projects: true,
        status: 'SHUTOFF',
      }),
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
    const [
      allServers,
      activeServers,
      errorServers,
      shutoffServers,
      allvolumes,
      attachVolumes,
      errorVolumes,
      availableVoloumes,
    ] = await Promise.all(promiseArray);
    const { count: allServersCount } = allServers;
    const { count: activeServersCount } = activeServers;
    const { count: errorServersCount } = errorServers;
    const { count: shutoffServersCount } = shutoffServers;
    const { count: allVolumesCount } = allvolumes;
    const { count: attachVolumesCount } = attachVolumes;
    const { count: errorVolumesCount } = errorVolumes;
    const { count: availableVoloumesCount } = availableVoloumes;
    const serviceNum = {
      all: allServersCount,
      active: activeServersCount,
      error: errorServersCount,
      shutoff: shutoffServersCount,
      other:
        allServersCount -
        (activeServersCount + errorServersCount + shutoffServersCount),
    };
    const volumeNum = {
      all: allVolumesCount,
      active: attachVolumesCount,
      error: errorVolumesCount,
      unattache: availableVoloumesCount,
      other:
        allVolumesCount -
        (attachVolumesCount + errorVolumesCount + availableVoloumesCount),
    };
    this.virtualResource = { serviceNum, volumeNum };
    this.virtualResourceLoading = false;
  }

  @action
  async getComputeService() {
    this.computeServiceLoading = true;
    const servicesResult = await client.nova.services.list();
    const { services } = servicesResult;
    this.computeService = services;
    this.computeServiceLoading = false;
  }

  @action
  async getNetworkService() {
    this.networkServiceLoading = true;
    const networkResult = await client.neutron.agents.list();
    const { agents } = networkResult;
    this.networkService = agents;
    this.networkServiceLoading = false;
  }
}
