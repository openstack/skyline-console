import { action, observable } from 'mobx';
import { imageApi } from 'src/apis/imageApi';

export class CosImageStore {
  @observable
  imageMaterials = {};

  @observable
  isImageMaterialsLoading = false;

  @observable
  imageList = {};

  @observable
  isImageListLoading = false;

  @observable
  isImageCreating = false;

  @observable
  error = null;

  @action
  async fetchImageList(queryParams = {}) {
    this.isImageListLoading = true;
    this.error = null;

    try {
      const response = await imageApi.getImageList(queryParams);
      this.imageList = response || [];
    } catch (error) {
      this.error = error;
    } finally {
      this.isImageListLoading = false;
    }
  }

  @action
  async fetchImageMaterials() {
    this.isImageMaterialsLoading = true;
    this.error = null;

    try {
      const response = await imageApi.getImageMaterials();
      this.imageMaterials = response || [];
    } catch (error) {
      this.error = error;
    } finally {
      this.isImageMaterialsLoading = false;
    }
  }

  @action
  async createImage(queryParams, body) {
    this.isImageCreating = true;
    this.error = null;

    try {
      await imageApi.createImage(queryParams, body);
    } catch (error) {
      this.error = error;
    } finally {
      this.isImageCreating = false;
    }
  }
}

const cosImageStore = new CosImageStore();
export default cosImageStore;
