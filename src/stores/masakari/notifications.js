import Base from 'stores/base';
import client from 'client';
import { action } from 'mobx';

export class NotificationStore extends Base {
  get client() {
    return client.masakari.notifications;
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

const globalNotificationStore = new NotificationStore();
export default globalNotificationStore;
