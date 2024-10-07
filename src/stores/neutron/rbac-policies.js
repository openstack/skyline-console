import Base from 'stores/base';
import client from 'client';
import { qosEndpoint } from 'client/client/constants';

export class RbacPoliciesStore extends Base {
  get client() {
    return client.neutron.rbacPolicies;
  }

  get listFilterByProject() {
    return true;
  }

  get listResponseKey() {
    return 'rbac_policies';
  }

  get projectClient() {
    return client.keystone.projects;
  }

  get qosClient() {
    return client.neutron.qosPolicies;
  }

  get networkClient() {
    return client.neutron.networks;
  }

  get enableQosPolicy() {
    return qosEndpoint();
  }

  async listDidFetch(items) {
    const [
      { networks: allNetworks },
      qosPoliciesResult,
      { projects: allProjects },
    ] = await Promise.all([
      this.networkClient.list(),
      this.enableQosPolicy ? this.qosClient.list() : null,
      this.projectClient.list(),
    ]);
    const { policies: allPolicies = [] } = qosPoliciesResult || {};
    const updatedItems = items.map((item) => {
      const { object_id, target_tenant } = item;
      const networkOfItem = allNetworks.find(
        (network) => network.id === object_id
      );
      const policyOfItem = allPolicies.find(
        (policy) => policy.id === object_id
      );
      const targetTenant = allProjects.find(
        (project) => project.id === target_tenant
      );
      return {
        ...item,
        object_name: networkOfItem
          ? networkOfItem.name
          : policyOfItem
          ? policyOfItem.name
          : '-',
        target_tenant_name: targetTenant ? targetTenant.name : '*',
        target_tenant_id: target_tenant === '*' ? '' : target_tenant,
      };
    });
    return updatedItems;
  }

  async detailDidFetch(item) {
    const { object_type, object_id, target_tenant } = item;
    let objectRequest = null;
    let projectRequest = null;
    if (object_type === 'network') {
      objectRequest = this.networkClient.show(object_id);
    } else if (object_type === 'qos_policy') {
      objectRequest = this.qosClient.show(object_id);
    }
    if (target_tenant !== '*') {
      projectRequest = this.projectClient.show(target_tenant);
    }
    const [objectResult, projectResult] = await Promise.allSettled([
      objectRequest,
      projectRequest,
    ]);
    const { network, qos_policy } = objectResult.value || {};
    return {
      ...item,
      object: network || qos_policy,
      targetProject: projectResult.value?.project,
    };
  }
}

const globalRbacPoliciesStore = new RbacPoliciesStore();
export default globalRbacPoliciesStore;
