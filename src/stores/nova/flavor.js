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

/* eslint-disable prefer-destructuring */
import { action, observable } from 'mobx';
import client from 'client';
import Base from 'stores/base';

export class FlavorStore extends Base {
  @observable
  access = [];

  get listWithDetail() {
    return true;
  }

  get client() {
    return client.nova.flavors;
  }

  getGpuInfo = (record) => {
    const { extra_specs = {} } = record || {};
    const alias = extra_specs['pci_passthrough:alias'];
    const vgpu = extra_specs['resources:VGPU'];
    const category = extra_specs[':category'];
    let gpuType = '-';
    let gpuCount = '-';
    let usbType = '-';
    let usbCount = '-';
    if (vgpu) {
      gpuType = (vgpu || '').split(':')[0];
      gpuCount = (vgpu || '').split(':')[1];
    }
    if (alias) {
      if (category && !category.includes('visualization_')) {
        const gpu = alias.split(',')[0];
        const usb = alias.split(',')[1];
        gpuType = gpu.split(':')[0];
        gpuCount = gpu.split(':')[1];
        if (usb) {
          usbType = usb.split(':')[0];
          usbCount = usb.split(':')[1];
        }
      } else {
        const usb = alias.split(',')[0];
        usbType = usb.split(':')[0];
        usbCount = usb.split(':')[1];
      }
    }
    return {
      gpuType,
      gpuCount,
      usbType,
      usbCount,
    };
  };

  get mapperBeforeFetchProject() {
    return (data) => {
      const { extra_specs = {}, ...rest } = data;
      const { key, ...extraRest } = extra_specs;
      const gpuInfo = this.getGpuInfo(data);
      return {
        ...rest,
        ...extraRest,
        architecture: extraRest[':architecture'] || 'custom',
        category: extraRest[':category'],
        ...gpuInfo,
        is_public: rest['os-flavor-access:is_public'],
        extra_specs,
        originData: data,
      };
    };
  }

  get paramsFunc() {
    return (params) => {
      const { all_projects, name, ...rest } = params;
      if (all_projects) {
        return {
          ...rest,
          is_public: 'None',
        };
      }
      return {
        name,
        ...rest,
      };
    };
  }

  async listDidFetch(items) {
    // const { tab } = filters;

    // if (tab) {
    //   return items.filter((it) => it.architecture === tab);
    // }

    // Returns all flavors regardless of tab.
    return items;
  }

  @action
  async fetchAccess(id) {
    const result = await this.client.access.list(id);
    this.access = result.flavor_access;
  }

  @action
  async create(data, extraSpecs, accessControl) {
    const body = {};
    body[this.responseKey] = data;
    try {
      this.isSubmitting = true;
      const result = await this.client.create(body);
      const { id } = result.flavor;
      const extraBody = {
        extra_specs: extraSpecs,
      };
      if (accessControl && accessControl.length > 0) {
        await Promise.all(
          accessControl.map((it) => {
            const accessBody = {
              addTenantAccess: {
                tenant: it,
              },
            };
            return this.client.action(id, accessBody);
          })
        );
      }
      return this.submitting(this.client.extraSpecs.create(id, extraBody));
    } catch (error) {
      this.isSubmitting = false;
      return Promise.reject(error);
    }
  }

  @action
  async updateAccess(id, adds, dels) {
    this.isSubmitting = true;
    await Promise.all(
      adds.map((it) => {
        const accessBody = {
          addTenantAccess: {
            tenant: it,
          },
        };
        return this.client.action(id, accessBody);
      })
    );
    return this.submitting(
      Promise.all(
        dels.map((it) => {
          const accessBody = {
            removeTenantAccess: {
              tenant: it,
            },
          };
          return this.client.action(id, accessBody);
        })
      )
    );
  }

  @action
  async createExtraSpecs(id, extraSpecs) {
    const extraBody = {
      extra_specs: extraSpecs,
    };
    return this.submitting(this.client.extraSpecs.create(id, extraBody));
  }

  @action
  async deleteExtraSpecs(id, key) {
    return this.submitting(this.client.extraSpecs.delete(id, key));
  }

  @action
  async putExtraSpecs(id, key, body) {
    return this.submitting(this.client.extraSpecs.update(id, key, body));
  }

  @action
  async updateExtraSpecs(id, adds = [], updates = [], dels = []) {
    if (adds.length > 0) {
      const addBody = {};
      adds.forEach((item) => {
        addBody[item.key] = item.value;
      });
      await this.createExtraSpecs(id, addBody);
    }
    if (updates.length > 0) {
      await Promise.all(
        updates.map((item) =>
          this.putExtraSpecs(id, item.key, { [item.key]: item.value })
        )
      );
    }
    if (dels.length > 0) {
      await Promise.all(dels.map((item) => this.deleteExtraSpecs(id, item)));
    }
    return Promise.resolve();
  }
}

const globalFlavorStore = new FlavorStore();
export default globalFlavorStore;
