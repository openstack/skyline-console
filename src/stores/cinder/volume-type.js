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
import client from 'client';
import { uniq } from 'lodash';
import Base from 'stores/base';

export class VolumeTypeStore extends Base {
  @observable
  access = [];

  @observable
  projectVolumeTypes = [];

  get client() {
    return client.cinder.types;
  }

  get qosClient() {
    return client.cinder.qosSpecs;
  }

  get listFilterByProject() {
    return false;
  }

  get paramsFuncPage() {
    return (params) => {
      const { current, showEncryption, showQoS, ...rest } = params;
      return rest;
    };
  }

  get paramsFunc() {
    return this.paramsFuncPage;
  }

  get mapper() {
    return (data) => {
      const { extra_specs: { multiattach = 'False' } = {} } = data;
      return {
        ...data,
        multiattach: multiattach === '<is> True',
        enableBilling: this.enableBilling,
      };
    };
  }

  async listDidFetch(items, allProjects, filters) {
    const { showEncryption, showQoS } = filters || {};
    if (items.length === 0) {
      return items;
    }
    if (showQoS) {
      const qosIds = uniq(
        items.filter((it) => !!it.qos_specs_id).map((it) => it.qos_specs_id)
      );
      if (qosIds.length) {
        const qosReqs = qosIds.map((id) => this.qosClient.show(id));
        const qosResults = await Promise.all(qosReqs);
        const qosItems = qosResults.map((it) => it.qos_specs);
        items.forEach((it) => {
          if (it.qos_specs_id) {
            it.qos_specs = qosItems.find((qos) => qos.id === it.qos_specs_id);
            it.qos_specs_name = it.qos_specs?.name;
            it.qos_props = it.qos_specs?.specs || {};
          }
        });
      }
    }
    if (!showEncryption) {
      return items;
    }
    const promiseList = items.map((i) => this.client.encryption.list(i.id));
    const encryptionList = await Promise.all(promiseList);
    const result = items.map((i) => {
      const { id } = i;
      const encryption = encryptionList.find((e) => e.volume_type_id === id);
      return {
        ...i,
        encryption,
      };
    });
    return result;
  }

  async detailDidFetch(item) {
    const { id } = item || {};
    const result = await this.client.encryption.list(id);
    item.encryption = result;
    return item;
  }

  @action
  update(id, data) {
    const body = {};
    body[this.responseKey] = data;
    return this.submitting(this.client.update(id, body));
  }

  @action
  createEncryption(id, data) {
    const body = {
      encryption: data,
    };
    return this.submitting(this.client.encryption.create(id, body));
  }

  @action
  deleteEncryption(id, encryption_id) {
    return this.submitting(this.client.encryption.delete(id, encryption_id));
  }

  @action
  async create(data, projectIds = []) {
    const body = {};
    body[this.responseKey] = data;
    if (projectIds.length === 0) {
      return this.submitting(this.client.create(body));
    }
    this.isSubmitting = true;
    const result = await this.client.create(body);
    const { id } = result[this.responseKey];
    return this.addProjectAccess(id, projectIds);
  }

  @action
  addProjectAccess(id, projectIds = []) {
    return this.submitting(
      Promise.all(
        projectIds.map((it) => {
          const actionBody = {
            addProjectAccess: {
              project: it,
            },
          };
          return this.client.action(id, actionBody);
        })
      )
    );
  }

  @action
  removeProjectAccess(id, projectIds = []) {
    return this.submitting(
      Promise.all(
        projectIds.map((it) => {
          const actionBody = {
            removeProjectAccess: {
              project: it,
            },
          };
          return this.client.action(id, actionBody);
        })
      )
    );
  }

  @action
  async fetchProjectAccess(id) {
    const result = await this.client.getAccess(id);
    this.access = result.volume_type_access;
  }

  @action
  async updateProjectAccess({ id, adds = [], dels = [], newPublic }) {
    const more = adds.length > 0 || dels.length > 0;
    if (newPublic !== undefined) {
      if (newPublic || !more) {
        return this.update(id, { is_public: newPublic });
      }
      await this.update(id, { is_public: newPublic });
    }
    await this.removeProjectAccess(id, dels);
    return this.addProjectAccess(id, adds);
  }

  @action
  async fetchProjectVolumeTypes(projectId) {
    const result = await this.client.list({ is_public: 'None' });
    const { volume_types: types } = result;
    const privateTypes = types.filter((it) => !it.is_public);
    if (!privateTypes.length) {
      this.projectVolumeTypes = types;
      return types;
    }
    const projectTypes = types.filter((it) => it.is_public);
    const reqs = privateTypes.map((it) => this.client.getAccess(it.id));
    const accessResults = await Promise.all(reqs);
    accessResults.forEach((it) => {
      const { volume_type_access: access } = it;
      const item = access.find((a) => a.project_id === projectId);
      if (item) {
        const type = types.find((t) => t.id === item.volume_type_id);
        projectTypes.push(type);
      }
    });
    this.projectVolumeTypes = projectTypes;
    return projectTypes;
  }
}
const globalVolumeTypeStore = new VolumeTypeStore();
export default globalVolumeTypeStore;
