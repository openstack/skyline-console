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
    extendObservable(this, {
      projectInfoLoading: true,
      computeServiceLoading: true,
      networkServiceLoading: true,
      computeService: [],
      networkService: [],
      platformNum: {
        projectNum: 0,
        userNum: 0,
        nodeNum: 0,
      },
    });
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
