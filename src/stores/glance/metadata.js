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
import Base from 'stores/base';

export class MetadataStore extends Base {
  @observable
  resourceTypes = [];

  @observable
  resourceTypeLoading = false;

  get client() {
    return client.glance.namespaces;
  }

  get resourceTypeClient() {
    return client.glance.resourceTypes;
  }

  get needGetProject() {
    return false;
  }

  async listDidFetch(items, allProjects, filters) {
    const { manage, resource_types } = filters;
    if (!manage) {
      return items;
    }
    const results = await Promise.all(
      items.map((it) => {
        const { namespace } = it;
        return this.client.show(namespace, { resource_type: resource_types });
      })
    );
    items.forEach((it, index) => {
      it.detail = results[index];
    });
    const newItems = [];
    items.forEach((item) => {
      if (!item.detail.objects) {
        newItems.push(item);
      } else {
        item.detail.objects.forEach((ob) => {
          newItems.push({
            ...item,
            detail: ob,
            isObject: true,
            objName: ob.name,
            objDescription: ob.description,
          });
        });
      }
    });
    return newItems;
  }

  get mapper() {
    return (data) => {
      const {
        visibility,
        namespace,
        display_name,
        resource_type_associations: associations = [],
      } = data;
      associations.forEach((it) => {
        it.prefix = it.prefix || '';
      });
      return {
        ...data,
        public: visibility === 'public',
        id: namespace,
        name: display_name,
        resource_type_associations: associations,
      };
    };
  }

  @action
  async fetchDetail({ id }) {
    this.isLoading = true;
    const result = await this.client.show(id);
    this.detail = result;
    this.isLoading = false;
    return result;
  }

  @action
  edit({ id }, newObject) {
    return this.submitting(this.client.update(id, newObject));
  }

  @action
  create(newObject) {
    return this.submitting(this.client.create(newObject));
  }

  @action
  async fetchResourceTypes(item) {
    this.resourceTypeLoading = true;
    const result = await this.resourceTypeClient.list();
    const { resource_type_associations: associations = [] } = item || {};
    const { resource_types: resourceTypes = [] } = result;
    const mapper = {};
    associations.forEach((it) => {
      mapper[it.name] = it.prefix || '';
    });
    resourceTypes.forEach((it) => {
      it.id = it.name;
      if (mapper[it.name]) {
        it.prefix = mapper[it.name];
      }
    });
    this.resourceTypes = resourceTypes;
    this.resourceTypeLoading = false;
  }

  @action
  async manageResourceTypes(namespace, dels, adds) {
    this.isSubmitting = true;
    await Promise.all(
      dels.map((it) => {
        return this.client.resourceTypes.delete(namespace, it.name);
      })
    );
    return this.submitting(
      Promise.all(
        adds.map((it) => {
          const body = {
            name: it.name,
            prefix: it.prefix,
          };
          return this.client.resourceTypes.create(namespace, body);
        })
      )
    );
  }
}

const globalMetadataStore = new MetadataStore();
export default globalMetadataStore;
