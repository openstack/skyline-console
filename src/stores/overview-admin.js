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
import {
  keystoneBase,
  novaBase,
  neutronBase,
  courierBase,
  prometheusSidecarBase,
  skylineBase,
  glanceBase,
} from 'utils/constants';

export default class OverviewStore {
  constructor() {
    this.reset(true);
  }

  get keystone() {
    return keystoneBase();
  }

  get nova() {
    return novaBase();
  }

  get neutron() {
    return neutronBase();
  }

  get courier() {
    return courierBase();
  }

  get alert() {
    return prometheusSidecarBase();
  }

  get glance() {
    return glanceBase();
  }

  @action
  reset = (init) => {
    const state = {
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
        ticketNum: 0,
        criticalNum: 0,
      },
    };

    if (init) {
      extendObservable(this, state);
    } else {
      Object.keys(state).forEach((key) => {
        this[key] = state[key];
      });
    }
  };

  @action
  requestPromise = (url) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const data = request.get(url);
        resolve(data);
      }, 100);
    }).catch(() => {
      return {};
    });
  };

  @action
  getProjectInfoData = async () => {
    this.projectInfoLoading = true;
    const promiseArray = [
      `${this.keystone}/projects`,
      `${this.keystone}/users`,
      `${this.nova}/os-services?binary=nova-compute`,
    ];
    const [projectsResult, userResult, hostResult] = await Promise.all(
      promiseArray.map((promiseItem) => {
        return this.requestPromise(promiseItem);
      })
    );
    const { projects = [] } = projectsResult;
    const { users = [] } = userResult;
    const { services = [] } = hostResult;
    this.platformNum.projectNum = projects.length;
    this.platformNum.userNum = users.length;
    this.platformNum.nodeNum = services.length;
    this.projectInfoLoading = false;
  };

  @action
  getVirtualResource = async () => {
    this.virtualResourceLoading = true;
    const promiseArray = [
      `${skylineBase()}/extension/servers?all_projects=true`,
      `${skylineBase()}/extension/servers?all_projects=true&status=ACTIVE`,
      `${skylineBase()}/extension/servers?all_projects=true&status=ERROR`,
      `${skylineBase()}/extension/servers?all_projects=true&status=SHUTOFF`,
      `${skylineBase()}/extension/volumes?limit=10&all_projects=true`,
      `${skylineBase()}/extension/volumes?limit=10&all_projects=true&status=in-use`,
      `${skylineBase()}/extension/volumes?limit=10&all_projects=true&status=error`,
      `${skylineBase()}/extension/volumes?limit=10&all_projects=true&status=available`,
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
    ] = await Promise.all(
      promiseArray.map((promiseItem) => {
        return this.requestPromise(promiseItem);
      })
    );
    const { count: allVolumesCount } = allvolumes;
    const { count: attachVolumesCount } = attachVolumes;
    const { count: errorVolumesCount } = errorVolumes;
    const { count: availableVoloumesCount } = availableVoloumes;
    const serviceNum = {
      all: allServers.servers.length,
      active: activeServers.servers.length,
      error: errorServers.servers.length,
      shutoff: shutoffServers.servers.length,
      other:
        allServers.servers.length -
        (activeServers.servers.length +
          errorServers.servers.length +
          shutoffServers.servers.length),
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
  };

  @action
  getComputeService = async () => {
    this.computeServiceLoading = true;
    const servicesResult = await request.get(`${this.nova}/os-services`);
    const { services } = servicesResult;
    this.computeService = services;
    this.computeServiceLoading = false;
  };

  @action
  getNetworkService = async () => {
    this.networkServiceLoading = true;
    const networkResult = await request.get(`${this.neutron}/agents`);
    const { agents } = networkResult;
    this.networkService = agents;
    this.networkServiceLoading = false;
  };
}
