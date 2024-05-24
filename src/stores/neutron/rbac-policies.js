import Base from 'stores/base';
import client from 'client';

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

  async listDidFetch(items) {
    const [
      { networks: allNetworks },
      { policies: allPolicies },
      { projects: allProjects },
    ] = await Promise.all([
      this.networkClient.list(),
      this.qosClient.list(),
      this.projectClient.list(),
    ]);
    const updatedItems = items.map((item) => {
      const networkOfItem = allNetworks.find(
        (network) => network.id === item.object_id
      );
      const policyOfItem = allPolicies.find(
        (policy) => policy.id === item.object_id
      );
      const targetTenant = allProjects.find(
        (project) => project.id === item.target_tenant
      );
      return {
        ...item,
        object_name: networkOfItem
          ? networkOfItem.name
          : policyOfItem
          ? policyOfItem.name
          : '-',
        target_tenant_name: targetTenant ? targetTenant.name : '*',
      };
    });
    return updatedItems;
  }

  async getProjects() {
    await this.projectClient.list();
  }

  async getQoSPolicy() {
    await this.qosPolicyClient.list();
  }

  async getNetworks() {
    await this.networkClient.list();
  }
}

const globalRbacPoliciesStore = new RbacPoliciesStore();
export default globalRbacPoliciesStore;
