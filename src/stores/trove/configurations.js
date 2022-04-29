import Base from 'stores/base';
import client from 'client';
import { action } from 'mobx';

export class ConfigurationsStore extends Base {
  get client() {
    return client.trove.configurations;
  }

  @action
  async create(newbody) {
    return this.client.create(newbody);
  }

  @action
  async delete({ params }, newbody) {
    return this.client.delete(params, newbody);
  }
}

const globalConfigurationsStore = new ConfigurationsStore();
export default globalConfigurationsStore;
