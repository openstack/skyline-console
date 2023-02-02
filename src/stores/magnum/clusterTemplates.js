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

import Base from 'stores/base';
import client from 'client';
import { action } from 'mobx';
import { isBoolean } from 'lodash';
import { allSettled } from 'utils';

export class ClusterTemplatesStore extends Base {
  get client() {
    return client.magnum.clusterTemplates;
  }

  get flavorClient() {
    return client.nova.flavors;
  }

  get networkClient() {
    return client.neutron.networks;
  }

  get subnetClient() {
    return client.neutron.subnets;
  }

  get imageClient() {
    return client.glance.images;
  }

  get listWithDetail() {
    return true;
  }

  @action
  async create(newbody) {
    return this.submitting(this.client.create(newbody));
  }

  @action
  async delete({ id }) {
    return this.client.delete(id);
  }

  @action
  async update({ id }, body) {
    const newBody = Object.keys(body)
      .filter(
        (key) =>
          !(
            ['network_driver', 'external_network_id'].includes(key) &&
            !body[key]
          )
      )
      .map((key) => ({
        path: `/${key}`,
        value:
          key === 'labels'
            ? JSON.stringify(body[key] || {})
            : isBoolean(body[key])
            ? `${body[key]}`
            : body[key],
        op: [null, undefined, ''].includes(body[key]) ? 'remove' : 'replace',
      }));
    return this.submitting(this.client.patch(id, newBody));
  }

  get mapper() {
    return (data) => ({
      ...data,
      id: data.uuid,
    });
  }

  async listDidFetch(items, _, filters) {
    if (!items.length) return items;
    const { shouldFetchProject } = filters;
    const newData = await this.listDidFetchProject(items, {
      all_projects: shouldFetchProject,
    });
    const { keypairs = [] } = (await client.nova.keypairs.list()) || {};
    return newData.map((it) => {
      const keypair = keypairs.find((k) => k?.keypair?.name === it.keypair_id);
      if (!keypair) {
        it.original_keypair_id = it.keypair_id;
        it.keypair_id = null;
      }
      return it;
    });
  }

  async detailDidFetch(item) {
    const [kp = {}, fr = {}, mfr = {}, ext = {}, fx = {}, sub = {}, img] =
      await allSettled([
        client.nova.keypairs.list(),
        item.flavor_id ? this.flavorClient.show(item.flavor_id) : {},
        item.master_flavor_id
          ? this.flavorClient.show(item.master_flavor_id)
          : {},
        item.external_network_id
          ? this.networkClient.show(item.external_network_id)
          : {},
        item.fixed_network ? this.networkClient.show(item.fixed_network) : {},
        item.fixed_subnet ? this.subnetClient.show(item.fixed_subnet) : {},
        item.image_id ? this.imageClient.show(item.image_id) : {},
      ]);
    if (kp.status === 'fulfilled') {
      const { keypairs = [] } = kp.value;
      const keypair = keypairs.find(
        (k) => k?.keypair?.name === item.keypair_id
      );
      if (!keypair) {
        item.original_keypair_id = item.keypair_id;
        item.keypair_id = null;
      }
    }
    if (fr.status === 'fulfilled') {
      const { flavor } = fr.value;
      item.flavor = flavor;
    } else {
      item.original_flavor_id = item.flavor_id;
      item.flavor_id = null;
    }
    if (mfr.status === 'fulfilled') {
      const { flavor: masterFlavor } = mfr.value;
      item.masterFlavor = masterFlavor;
    } else {
      item.original_master_flavor_id = item.master_flavor_id;
      item.master_flavor_id = null;
    }
    if (ext.status === 'fulfilled') {
      const { network } = ext.value;
      item.externalNetwork = network;
    } else {
      item.original_external_network_id = item.external_network_id;
      item.external_network_id = null;
    }
    if (fx.status === 'fulfilled') {
      const { network: fixedNetwork } = fx.value;
      item.fixedNetwork = fixedNetwork;
    } else {
      item.original_fixed_network = item.fixed_network;
      item.fixed_network = null;
    }
    if (sub.status === 'fulfilled') {
      const { subnet: fixedSubnet } = sub.value;
      item.fixedSubnet = fixedSubnet;
    } else {
      item.original_fixed_subnet = item.fixed_subnet;
      item.fixed_subnet = null;
    }
    if (img.status === 'fulfilled') {
      item.image = img.value;
    } else {
      item.original_image_id = item.image_id;
      item.image_id = null;
    }

    return item;
  }
}

const globalClusterTemplateStore = new ClusterTemplatesStore();
export default globalClusterTemplateStore;
