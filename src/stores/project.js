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

import { action, observable } from 'mobx';
import { keystoneBase } from 'utils/constants';
import { has } from 'lodash';

class ProjectMapStore {
  @observable
  projectMap = {};

  @action
  async fetchProjectDetail({ id }) {
    const project = {
      id,
    };
    if (!has(this.projectMap, id)) {
      const result = await request.get(
        `${keystoneBase()}/projects/${id}`,
        {},
        null,
        () => Promise.resolve('error')
      );
      this.projectMap[id] = result === 'error' ? '' : result.project.name;
    }
    project.name = this.projectMap[id] || '-';
    return project;
  }

  getItemProjectId(item) {
    return (
      item.project_id ||
      item.tenant_id ||
      item.owner ||
      item.owner_id ||
      item.tenant ||
      item.fingerprint
    );
  }

  getItemProjectName(item) {
    return item.project_name || item.owner_project_name;
  }

  @action
  clearData() {
    this.projectMap = {};
  }
}

const globalProjectMapStore = new ProjectMapStore();
export default globalProjectMapStore;
