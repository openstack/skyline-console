import { action, observable } from 'mobx';
import { volumeApi } from 'src/apis/volumeApi';

export class CosVolumeStore {
  @observable
  volumeList = {};

  @observable
  isVolumeListLoading = false;

  @observable
  isVolumeCreating = false;

  @observable
  error = null;

  @action
  async fetchVolumeList(queryParams = {}) {
    this.isVolumeListLoading = true;
    this.error = null;

    try {
      const response = await volumeApi.getVolumeList(queryParams);
      this.volumeList = response || [];
    } catch (error) {
      this.error = error;
    } finally {
      this.isVolumeListLoading = false;
    }
  }

  @action
  async createVolumeFromImage(queryParams, body) {
    this.isVolumeCreating = true;
    this.error = null;

    try {
      await volumeApi.createVolumeFromImage(queryParams, body);
    } catch (error) {
      this.error = error;
    } finally {
      this.isVolumeCreating = false;
    }
  }
}

const cosVolumeStore = new CosVolumeStore();
export default cosVolumeStore;
