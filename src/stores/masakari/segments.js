import Base from 'stores/base';
import client from 'client';
import { action } from 'mobx';

export class SegmentStore extends Base {
  get client() {
    return client.masakari.segments;
  }

  @action
  async create(newbody) {
    return this.client.create(newbody);
  }

  @action
  async delete({ id }) {
    return this.client.delete(id);
  }

  @action
  update(id, body) {
    return this.submitting(this.client.update(id, body));
  }
}

const globalSegmentStore = new SegmentStore();
export default globalSegmentStore;
