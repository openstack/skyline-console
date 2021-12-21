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

import { action } from 'mobx';
import client from 'client';
import Base from '../base';

export class ContainerStore extends Base {
  get client() {
    return client.swift.container;
  }

  get listResponseKey() {
    return '';
  }

  get paramsFunc() {
    return (params) => {
      return {
        ...params,
        format: 'json',
      };
    };
  }

  get mapper() {
    return (data) => ({
      ...data,
      id: data.name,
    });
  }

  async detailFetchByClient(resourceParams) {
    const { name } = resourceParams;
    const result = await this.client.showMetadata(name);
    const { headers = {} } = result;
    const isPublic = !!headers['x-container-read'];
    let link = null;
    if (isPublic) {
      link = this.client.url(name);
    }
    const data = {
      used: headers['x-container-bytes-used'],
      object_count: headers['x-container-object-count'],
      storage_policy: headers['x-storage-policy'],
      timestamp: headers['x-timestamp'],
      is_public: isPublic,
      link,
    };
    return data;
  }

  @action
  checkName = async (name) => {
    try {
      await this.client.showMetadata(name);
      const err = {
        response: {
          data: t('A container with the same name already exists'),
        },
      };
      return Promise.reject(err);
    } catch (e) {
      return true;
    }
  };

  @action
  async create(data) {
    const { name, isPublic } = data;
    await this.checkName(name);
    if (!isPublic) {
      return this.submitting(this.client.create(name));
    }
    this.isSubmitting = true;
    await this.client.create(name);
    return this.updatePublic(name, isPublic);
  }

  @action
  delete = async ({ id }) => {
    return this.submitting(this.client.delete(id));
  };

  @action
  updatePublic = async (name, isPublic) => {
    const headers = {
      'X-Container-Read': isPublic ? '.r:*,.rlistings' : '',
    };
    return this.submitting(this.client.updateMetadata(name, headers));
  };
}

const globalContainerStore = new ContainerStore();
export default globalContainerStore;
