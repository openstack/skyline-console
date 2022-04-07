import Base from 'stores/base';
import client from 'client';
import { action } from 'mobx';

export class BackupsStore extends Base {
  get client() {
    return client.trove.backups;
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

const globalBackupsStore = new BackupsStore();
export default globalBackupsStore;
