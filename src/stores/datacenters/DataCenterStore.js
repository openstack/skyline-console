import axios from 'axios';
import { action, observable, runInAction } from 'mobx';

class DataCenterStore {
  @observable
  isLoading = true;

  @observable
  dataCenter = undefined;

  @action.bound
  async fetchDataCenters() {
    try {
      const dataCenters = (await axios.get('/cos-api/v1/datacenters')).data
        ?.data;
      runInAction(() => {
        this.dataCenter = dataCenters.find((item) => item.isLocal);
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to get data centers: ', error);
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }
}

export const dataCenterStore = new DataCenterStore();
