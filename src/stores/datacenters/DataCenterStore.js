import { action, observable, runInAction } from 'mobx';
import { dataCenterApi } from 'src/apis/dataCenterApi';

class DataCenterStore {
  @observable
  isLoading = true;

  @observable
  dataCenter = undefined;

  @action.bound
  async fetchDataCenters() {
    try {
      const dataCenters = await dataCenterApi.getDataCenters();
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
