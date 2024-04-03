import Base from 'stores/base';
import client from 'client';
import { action } from 'mobx';

export class HostStore extends Base {
  get client() {
    return client.masakari.segments.hosts;
  }

  get segmentClient() {
    return client.masakari.segments;
  }

  get isSubResource() {
    return true;
  }

  detailFetchByClient(resourceParams) {
    return this.client.show(resourceParams.id, resourceParams.uuid);
  }

  get paramsFunc() {
    return (params) => {
      const { id } = params;

      return { segment_id: id };
    };
  }

  async listFetchByClient(params) {
    const result = [];

    if (params.segment_id) {
      await this.client.list(params.segment_id).then((response) => {
        response.hosts.map((item) => result.push(item));
      });
    } else {
      await this.segmentClient.list().then(async (segmentList) => {
        const segmentHosts = segmentList.segments.map((it) =>
          this.client.list(it.uuid).then((getHost) => getHost.hosts)
        );
        await Promise.all(segmentHosts).then((hostList) => {
          hostList.forEach((host) => {
            host.forEach((item) => {
              result.push(item);
            });
          });
        });
      });
    }
    return { hosts: result };
  }

  @action
  async create(segment_id, newbody) {
    return this.client.create(segment_id, newbody);
  }

  @action
  delete = ({ segment_id, host_id }) =>
    this.submitting(this.client.delete(segment_id, host_id));

  @action
  update(segmentId, id, body) {
    return this.submitting(this.client.update(segmentId, id, body));
  }
}

const globalHostStore = new HostStore();
export default globalHostStore;
