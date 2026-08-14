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
import { Address4, Address6 } from 'ip-address';
import { allSettled } from 'utils';

export class ClustersStore extends Base {
  get client() {
    return client.magnum.clusters;
  }

  get templateClient() {
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

  get portClient() {
    return client.neutron.ports;
  }

  get stackClient() {
    return client.heat.stacks;
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
  async resize({ id }, newbody) {
    return this.client.resize(id, newbody, null, {
      headers: { 'OpenStack-API-Version': 'container-infra latest' },
    });
  }

  async upgrade({ id }, body) {
    return this.client.upgrade(id, body);
  }

  async listDidFetch(items, _, filters) {
    if (!items.length) return items;
    const { shouldFetchProject } = filters;
    const newData = await this.listDidFetchProject(items, {
      all_projects: shouldFetchProject,
    });
    const { keypairs = [] } = (await client.nova.keypairs.list()) || {};
    return newData.map((it) => {
      const keypair = keypairs.find((k) => k?.keypair?.name === it.keypair);
      if (!keypair) {
        it.original_keypair = it.keypair;
        it.keypair = null;
      }
      return it;
    });
  }

  isUuid(value) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      String(value || '')
    );
  }

  getIpAddress(value) {
    if (typeof value !== 'string' || /[/\s%]/.test(value)) {
      return null;
    }

    if (Address4.isValid(value)) {
      return new Address4(value).correctForm();
    }

    return Address6.isValid(value) ? new Address6(value).correctForm() : null;
  }

  normalizeNodeReference(value) {
    return this.getIpAddress(value) || String(value || '').toLowerCase();
  }

  getClusterProjectId(item) {
    return (
      item?.project_id ||
      item?.tenant_id ||
      item?.project?.id ||
      (typeof item?.project === 'string' ? item.project : null)
    );
  }

  getServerProjectParams(item, allProjects) {
    const allProjectsAllowed = Boolean(this.hasAdminRole);
    const projectId =
      this.getClusterProjectId(item) ||
      (!allProjects ? this.currentProjectId : null);

    return {
      all_projects: allProjectsAllowed,
      ...(allProjectsAllowed && projectId ? { project_id: projectId } : {}),
    };
  }

  getNeutronProjectParams(item, allProjects) {
    const projectId = this.getClusterProjectId(item);
    const crossProject =
      this.hasAdminRole && projectId && projectId !== this.currentProjectId;

    if (!this.hasAdminRole || (!allProjects && !crossProject)) {
      return {};
    }

    return projectId ? { project_id: projectId } : {};
  }

  getServerNames(server) {
    return [
      server?.origin_data?.name,
      server?.name,
      server?.origin_data?.['OS-EXT-SRV-ATTR:hostname'],
      server?.['OS-EXT-SRV-ATTR:hostname'],
      server?.hostname,
    ].filter((name) => typeof name === 'string' && name);
  }

  getServerAddresses(server) {
    const addresses = [
      ...(server.fixed_addresses || []),
      ...(server.floating_addresses || []),
    ];

    Object.values(
      server.origin_data?.addresses || server.addresses || {}
    ).forEach((networkAddresses) => {
      if (Array.isArray(networkAddresses)) {
        addresses.push(...networkAddresses);
      }
    });

    return addresses
      .map((address) =>
        typeof address === 'string'
          ? address
          : address?.addr || address?.ip_address
      )
      .filter(Boolean);
  }

  getServerReferences(server) {
    const names = this.getServerNames(server);
    return [
      server.id,
      ...names,
      ...names.map((name) => name.split('.')[0]),
      ...this.getServerAddresses(server),
    ]
      .filter(Boolean)
      .map((value) => this.normalizeNodeReference(value));
  }

  getNodeNames(item) {
    const { health_status_reason = {} } = item;

    if (!health_status_reason || typeof health_status_reason !== 'object') {
      return [];
    }

    return Object.keys(health_status_reason)
      .filter((key) => key !== 'api' && key.endsWith('.Ready'))
      .map((key) => key.replace(/\.Ready$/, ''));
  }

  getNodeReferences(item) {
    const references = [
      ...(item.master_addresses || []),
      ...(item.node_addresses || []),
      ...this.getNodeNames(item),
    ];

    if (Array.isArray(item.nodegroups)) {
      item.nodegroups.forEach((nodegroup) => {
        if (Array.isArray(nodegroup?.node_addresses)) {
          references.push(...nodegroup.node_addresses);
        }
      });
    }

    return [
      ...new Set(
        references.filter((value) => typeof value === 'string' && value)
      ),
    ];
  }

  async getServersByReference(reference, item, allProjects) {
    const ip = this.getIpAddress(reference);
    if (!this.isUuid(reference) && !ip) {
      return [];
    }

    try {
      const result = await this.skylineClient.extension.servers({
        ...this.getServerProjectParams(item, allProjects),
        ...(ip ? { ip } : { uuid: reference }),
        limit: 1000,
        sort_keys: 'uuid',
        sort_dirs: 'asc',
      });
      return result?.servers || [];
    } catch (e) {
      return [];
    }
  }

  async getProjectServers(item, allProjects) {
    const references = new Set(
      this.getNodeReferences(item).map((value) =>
        this.normalizeNodeReference(value)
      )
    );
    const serversById = new Map();
    const markers = new Set();
    const projectParams = this.getServerProjectParams(item, allProjects);
    let marker;

    try {
      while (true) {
        // eslint-disable-next-line no-await-in-loop
        const result = await this.skylineClient.extension.servers({
          ...projectParams,
          limit: 1000,
          sort_keys: 'uuid',
          sort_dirs: 'asc',
          ...(marker ? { marker } : {}),
        });
        const servers = result?.servers || [];
        if (!servers.length) {
          break;
        }

        servers.forEach((server) => {
          if (
            server?.id &&
            this.getServerReferences(server).some((value) =>
              references.has(value)
            )
          ) {
            serversById.set(String(server.id), server);
          }
        });

        const nextMarker = servers[servers.length - 1]?.id;
        if (!nextMarker || markers.has(nextMarker)) {
          break;
        }
        markers.add(nextMarker);
        marker = nextMarker;
      }
    } catch (e) {}

    return Array.from(serversById.values());
  }

  getNodegroupMatchScore(server, item, reference) {
    if (!Array.isArray(item.nodegroups)) {
      return 0;
    }

    const normalizedReference = this.normalizeNodeReference(reference);
    const metadata = server.origin_data?.metadata || server.metadata || {};
    const scores = item.nodegroups
      .filter((group) =>
        (group?.node_addresses || []).some(
          (address) =>
            this.normalizeNodeReference(address) === normalizedReference
        )
      )
      .map((group) => {
        const labels = { ...group.labels, ...group.node_labels };
        return Object.entries(labels).reduce((score, [key, value]) => {
          if (metadata[key] === undefined) {
            return score;
          }
          return score + (String(metadata[key]) === String(value) ? 1 : -1);
        }, 0);
      });

    return scores.length ? Math.max(...scores) : 0;
  }

  getServerMatchRank(server, item, reference) {
    const names = this.getServerNames(server).map((name) => name.toLowerCase());
    const nodeNames = this.getNodeReferences(item)
      .filter((value) => !this.isUuid(value) && !this.getIpAddress(value))
      .map((name) => name.toLowerCase());
    const referenceIsName =
      !this.isUuid(reference) && !this.getIpAddress(reference);
    const expectedNames = referenceIsName
      ? [reference.toLowerCase()]
      : nodeNames;
    const exactName = names.some((name) => expectedNames.includes(name));
    const shortName = names.some((name) =>
      expectedNames.includes(name.split('.')[0])
    );
    const origin = server.origin_data || {};

    return [
      Number(String(origin.status || server.status).toUpperCase() === 'ACTIVE'),
      exactName ? 2 : Number(shortName),
      this.getNodegroupMatchScore(server, item, reference),
      Date.parse(origin.created || server.created_at || server.created) || 0,
      Date.parse(origin.updated || server.updated_at || server.updated) || 0,
    ];
  }

  selectNodeServer(servers, item, reference) {
    const normalizedReference = this.normalizeNodeReference(reference);
    const candidates = servers
      .filter((server) => {
        if (this.isUuid(reference)) {
          return String(server.id).toLowerCase() === normalizedReference;
        }
        if (this.getIpAddress(reference)) {
          return this.getServerAddresses(server).some(
            (address) =>
              this.normalizeNodeReference(address) === normalizedReference
          );
        }
        return true;
      })
      .map((server) => ({
        server,
        rank: this.getServerMatchRank(server, item, reference),
      }));

    candidates.sort((left, right) => {
      for (let index = 0; index < left.rank.length; index += 1) {
        const difference = right.rank[index] - left.rank[index];
        if (difference) {
          return difference;
        }
      }
      const leftId = String(left.server.id);
      const rightId = String(right.server.id);
      return leftId < rightId ? -1 : Number(leftId > rightId);
    });

    return candidates[0]?.server;
  }

  buildNodeServerMap(item, servers, allProjects) {
    const candidatesByReference = new Map();
    const projectId =
      this.getClusterProjectId(item) ||
      (!this.hasAdminRole || !allProjects ? this.currentProjectId : null);

    servers.forEach((server) => {
      const serverProjectId =
        server?.origin_data?.tenant_id ||
        server?.project_id ||
        server?.tenant_id;
      const status = server?.origin_data?.status || server?.status;
      if (
        !server?.id ||
        (projectId && serverProjectId && projectId !== serverProjectId) ||
        ['DELETED', 'SOFT_DELETED'].includes(String(status).toUpperCase())
      ) {
        return;
      }

      this.getServerReferences(server).forEach((reference) => {
        if (!candidatesByReference.has(reference)) {
          candidatesByReference.set(reference, new Map());
        }
        candidatesByReference.get(reference).set(String(server.id), server);
      });
    });

    const nodeServers = Object.create(null);
    const selectedServers = new Map();
    this.getNodeReferences(item).forEach((reference) => {
      const candidates = candidatesByReference.get(
        this.normalizeNodeReference(reference)
      );
      if (!candidates) {
        return;
      }

      const server = this.selectNodeServer(
        Array.from(candidates.values()),
        item,
        reference
      );
      if (server) {
        nodeServers[reference] = String(server.id);
        selectedServers.set(String(server.id), server);
      }
    });

    return { nodeServers, servers: Array.from(selectedServers.values()) };
  }

  async resolveNodeServers(item, allProjects) {
    const references = this.getNodeReferences(item);
    const directReferences = [
      ...new Set(
        references
          .filter((value) => this.isUuid(value) || this.getIpAddress(value))
          .map((value) => this.normalizeNodeReference(value))
      ),
    ];
    const serversById = new Map();

    for (let offset = 0; offset < directReferences.length; offset += 20) {
      // eslint-disable-next-line no-await-in-loop
      const results = await allSettled(
        directReferences
          .slice(offset, offset + 20)
          .map((reference) =>
            this.getServersByReference(reference, item, allProjects)
          )
      );
      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          (result.value || []).forEach((server) => {
            if (server?.id) {
              serversById.set(String(server.id), server);
            }
          });
        }
      });
    }

    const resolved = this.buildNodeServerMap(
      item,
      Array.from(serversById.values()),
      allProjects
    );
    if (references.every((reference) => resolved.nodeServers[reference])) {
      return resolved;
    }

    const fallbackServers = await this.getProjectServers(item, allProjects);
    fallbackServers.forEach((server) =>
      serversById.set(String(server.id), server)
    );
    return this.buildNodeServerMap(
      item,
      Array.from(serversById.values()),
      allProjects
    );
  }

  getPortForServer(server, ports, preferredNetworkId) {
    if (!ports.length) {
      return null;
    }

    if (preferredNetworkId) {
      const networkPort = ports.find(
        (port) =>
          port?.network_id === preferredNetworkId &&
          Array.isArray(port?.fixed_ips) &&
          port.fixed_ips.length
      );

      if (networkPort) {
        return networkPort;
      }
    }

    const fixedAddresses = new Set(
      (server?.fixed_addresses || []).filter(Boolean)
    );

    if (fixedAddresses.size) {
      const matchingPort = ports.find((port) =>
        (port?.fixed_ips || []).some((fixedIp) =>
          fixedAddresses.has(fixedIp?.ip_address)
        )
      );

      if (matchingPort) {
        return matchingPort;
      }
    }

    const computePort = ports.find(
      (port) =>
        String(port?.device_owner || '').startsWith('compute:') &&
        Array.isArray(port?.fixed_ips) &&
        port.fixed_ips.length
    );

    if (computePort) {
      return computePort;
    }

    return (
      ports.find(
        (port) => Array.isArray(port?.fixed_ips) && port.fixed_ips.length
      ) || null
    );
  }

  async resolveClusterNetwork(item, servers, allProjects) {
    if (!servers.length) {
      return;
    }

    const neutronProjectParams = this.getNeutronProjectParams(
      item,
      allProjects
    );

    const portResults = await allSettled(
      servers
        .filter((server) => server?.id)
        .map(async (server) => {
          const result = await this.portClient.list({
            device_id: server.id,
            ...neutronProjectParams,
          });

          const { ports = [] } = result || {};
          const port = this.getPortForServer(server, ports, item.fixed_network);

          return port
            ? {
                port,
                server,
              }
            : null;
        })
    );

    const matchedResult = portResults.find(
      (result) => result.status === 'fulfilled' && result.value?.port
    );

    if (!matchedResult) {
      return;
    }

    const { port: selectedPort, server: selectedServer } = matchedResult.value;

    const networkId = item.fixed_network || selectedPort.network_id;
    let subnetId = item.fixed_subnet;

    if (!subnetId) {
      const fixedAddresses = new Set(
        (selectedServer?.fixed_addresses || []).filter(Boolean)
      );

      const matchingFixedIp = (selectedPort.fixed_ips || []).find((fixedIp) =>
        fixedAddresses.has(fixedIp?.ip_address)
      );

      subnetId =
        matchingFixedIp?.subnet_id || selectedPort.fixed_ips?.[0]?.subnet_id;
    }

    if (networkId && !item.fixed_network) {
      item.fixed_network = networkId;
    }

    if (subnetId && !item.fixed_subnet) {
      item.fixed_subnet = subnetId;
    }

    const [networkResult, subnetResult] = await allSettled([
      networkId ? this.networkClient.show(networkId) : {},
      subnetId ? this.subnetClient.show(subnetId) : {},
    ]);

    if (
      networkId &&
      networkResult.status === 'fulfilled' &&
      networkResult.value?.network
    ) {
      item.fixedNetwork = networkResult.value.network;
    }

    if (
      subnetId &&
      subnetResult.status === 'fulfilled' &&
      subnetResult.value?.subnet
    ) {
      item.fixedSubnet = subnetResult.value.subnet;
    }
  }

  async detailDidFetch(item, allProjects) {
    const template =
      (await this.templateClient.show(item.cluster_template_id)) || {};
    item.template = template;
    const {
      flavor_id: templateFlavorId,
      master_flavor_id: templateMasterFlavorId,
      fixed_network: templateFixedNetworkId,
      fixed_subnet: templateSubnetId,
    } = template;
    const flavorId = item.flavor_id || templateFlavorId;
    const masterFlavorId = item.master_flavor_id || templateMasterFlavorId;
    const fixedNetworkId = item.fixed_network || templateFixedNetworkId;
    const fixedSubnetId = item.fixed_subnet || templateSubnetId;

    if (!item.flavor_id && flavorId) {
      item.flavor_id = flavorId;
    }

    if (!item.master_flavor_id && masterFlavorId) {
      item.master_flavor_id = masterFlavorId;
    }

    if (!item.fixed_network && fixedNetworkId) {
      item.fixed_network = fixedNetworkId;
    }

    if (!item.fixed_subnet && fixedSubnetId) {
      item.fixed_subnet = fixedSubnetId;
    }

    const [kp = {}, fr = {}, mfr = {}, fx = {}, sub = {}, stack] =
      await allSettled([
        client.nova.keypairs.list(),
        flavorId ? this.flavorClient.show(flavorId) : {},
        masterFlavorId ? this.flavorClient.show(masterFlavorId) : {},
        fixedNetworkId ? this.networkClient.show(fixedNetworkId) : {},
        fixedSubnetId ? this.subnetClient.show(fixedSubnetId) : {},
        item.stack_id ? this.stackClient.list({ id: item.stack_id }) : {},
      ]);
    if (kp.status === 'fulfilled') {
      const { keypairs = [] } = kp.value || {};
      const keypair = keypairs.find((k) => k?.keypair?.name === item.keypair);
      if (!keypair) {
        item.original_keypair = item.keypair;
        item.keypair = null;
      }
    }

    if (flavorId) {
      if (fr.status === 'fulfilled' && fr.value?.flavor) {
        item.flavor = fr.value.flavor;
      } else {
        item.original_flavor_id = item.flavor_id;
        item.flavor_id = null;
      }
    }

    if (masterFlavorId) {
      if (mfr.status === 'fulfilled' && mfr.value?.flavor) {
        item.masterFlavor = mfr.value.flavor;
      } else {
        item.original_master_flavor_id = item.master_flavor_id;
        item.master_flavor_id = null;
      }
    }

    if (fixedNetworkId) {
      if (fx.status === 'fulfilled' && fx.value?.network) {
        item.fixedNetwork = fx.value.network;
      } else {
        item.original_fixed_network = item.fixed_network;
        item.fixed_network = null;
      }
    }

    if (fixedSubnetId) {
      if (sub.status === 'fulfilled' && sub.value?.subnet) {
        item.fixedSubnet = sub.value.subnet;
      } else {
        item.original_fixed_subnet = item.fixed_subnet;
        item.fixed_subnet = null;
      }
    }

    if (stack.status === 'fulfilled') {
      const { stacks = [] } = stack.value || {};
      if (stacks[0]) {
        item.stack = stacks[0];
      }
    }

    const { nodeServers, servers } = await this.resolveNodeServers(
      item,
      allProjects
    );

    item.nodeServers = nodeServers;

    if ((!item.fixed_network || !item.fixed_subnet) && servers.length) {
      await this.resolveClusterNetwork(item, servers, allProjects);
    }

    return item;
  }

  get mapper() {
    return (data) => ({
      ...data,
      id: data.uuid,
    });
  }
}

const globalClustersStore = new ClustersStore();
export default globalClustersStore;