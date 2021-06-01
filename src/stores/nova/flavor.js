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
import { novaBase } from 'utils/constants';
import Base from '../base';

export class FlavorStore extends Base {
  @observable
  access = [];

  get module() {
    return 'flavors';
  }

  get apiVersion() {
    return novaBase();
  }

  get responseKey() {
    return 'flavor';
  }

  // get listFilterByProject() {
  //   return true;
  // }

  // getListDetailUrl = () => `${skylineBase()}/contrib/flavors`
  getListDetailUrl = () => `${this.apiVersion}/${this.module}/detail`;

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
      gpuType = 'vgpu';
      gpuCount = vgpu;
    }
    if (alias) {
      if (category && category.indexOf('_gpu') >= 0) {
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
      const gpuInfo = this.getGpuInfo(data);
      return {
        ...rest,
        ...extra_specs,
        architecture: extra_specs[':architecture'] || 'custom',
        category: extra_specs[':category'],
        ...gpuInfo,
        is_public: rest['os-flavor-access:is_public'],
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

  async listDidFetch(items, _, filters) {
    const { tab } = filters;
    const newItems = tab
      ? items.filter((it) => it.architecture === tab)
      : items;
    return newItems;
  }

  @action
  async fetchAccess(id) {
    const url = `${this.getDetailUrl({ id })}/os-flavor-access`;
    const result = await request.get(url);
    this.access = result.flavor_access;
  }

  @action
  async create(data, extraSpecs, accessControl) {
    const body = {};
    body[this.responseKey] = data;
    this.isSubmitting = true;
    const result = await request.post(this.getListUrl(), body);
    const { id } = result.flavor;
    const url = `${this.getDetailUrl({ id })}/os-extra_specs`;
    const extraBody = {
      extra_specs: extraSpecs,
    };
    if (accessControl && accessControl.length > 0) {
      await Promise.all(
        accessControl.map((it) => {
          const accessUrl = `${this.getDetailUrl({ id })}/action`;
          const accessBody = {
            addTenantAccess: {
              tenant: it,
            },
          };
          return request.post(accessUrl, accessBody);
        })
      );
    }
    return this.submitting(request.post(url, extraBody));
  }

  @action
  async updateAccess(id, adds, dels) {
    const url = `${this.getDetailUrl({ id })}/action`;
    this.isSubmitting = true;
    await Promise.all(
      adds.map((it) => {
        const accessBody = {
          addTenantAccess: {
            tenant: it,
          },
        };
        return request.post(url, accessBody);
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
          return request.post(url, accessBody);
        })
      )
    );
  }

  @action
  async createExtraSpecs(id, extraSpecs) {
    const url = `${this.getDetailUrl({ id })}/os-extra_specs`;
    const extraBody = {
      extra_specs: extraSpecs,
    };
    return this.submitting(request.post(url, extraBody));
  }

  @action
  async deleteExtraSpecs(id, key) {
    const url = `${this.getDetailUrl({ id })}/os-extra_specs/${key}`;
    return this.submitting(request.delete(url));
  }

  @action
  async putExtraSpecs(id, key, body) {
    const url = `${this.getDetailUrl({ id })}/os-extra_specs/${key}`;
    return this.submitting(request.put(url, body));
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
