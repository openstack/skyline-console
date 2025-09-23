import { action, observable } from 'mobx';
import client from 'client';
import BaseStore from 'stores/base';
import { imageApi } from 'src/apis/imageApi';
import { imageOS, isSnapshot } from 'resources/glance/image';
import { toUtcFormat } from 'utils/image';

export class CosImageStore extends BaseStore {
  @observable
  members = [];

  @observable
  imageMaterials = {};

  @observable
  isImageMaterialsLoading = false;

  @observable
  isImageCreating = false;

  @observable
  error = null;

  get client() {
    return client.glance.images;
  }

  get fetchListByLimit() {
    return true;
  }

  get paramsFunc() {
    return this.paramsFuncPage;
  }

  updateParamsSortPage = (params, sortKey, sortOrder) => {
    if (sortKey && sortOrder) {
      params.sort_key = sortKey;
      params.sort_dir = sortOrder === 'descend' ? 'desc' : 'asc';
    }
  };

  updateParamsSort = this.updateParamsSortPage;

  get paramsFuncPage() {
    return ({ current, all_projects, ...rest }) => rest;
  }

  get mergeData() {
    return (originImages, cosImages) => {
      const originMap = new Map(originImages.map((img) => [img.id, img]));

      return cosImages.map((cosImage) => {
        const matchedOriginImage = originMap.get(cosImage.id);

        const createdAt = toUtcFormat(cosImage.createdAt);

        const osDistro = imageOS[matchedOriginImage?.os_distro]
          ? matchedOriginImage.os_distro
          : 'others';

        const normalizedCosImage = {
          imageId: cosImage.id,
          imageName: cosImage.name,
          imageProject: cosImage.project,
          imageOS: cosImage.os,
          imageDomain: cosImage.domain,
          imageDestination: cosImage.destination,
          imageDiskType: cosImage.diskType,
          imageVisibility: cosImage.visibility,
          imageSize: cosImage.sizeMiB,
          imageCreatedAt: cosImage.createdAt,
          imageStatus: cosImage.status || '',
          imageMetadata: cosImage.metadata || {},
        };

        return {
          ...matchedOriginImage,
          ...normalizedCosImage,
          id: cosImage.id,
          created_at: createdAt || matchedOriginImage?.created_at || null,
          os_distro: osDistro,
        };
      });
    };
  }

  get mapperBeforeFetchProject() {
    return (data) => ({
      originData: { ...data },
      ...data,
      project_id: data.owner,
      project_name: data.owner_project_name || data.project_name,
    });
  }

  listDidFetch(items) {
    if (items.length === 0) {
      return items;
    }
    return items.filter((it) => !isSnapshot(it));
  }

  // Build params with sorting applied
  buildParams(rest, sortKey, sortOrder) {
    const params = { ...rest };
    this.updateParamsSort(params, sortKey, sortOrder);
    return params;
  }

  dedupeById(list = []) {
    const seen = new Set();
    return list.filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  }

  async fetchListFromSources(cosParams = {}, glanceParams = {}) {
    const [{ images: cosImages }, originImages] = await Promise.all([
      imageApi.getImageList({ pageSize: 9999, pageNum: 1, ...cosParams }),
      this.requestList(glanceParams),
    ]);

    return { cosImages, originImages };
  }

  @action
  async update({ id }, newBody) {
    return this.client.patch(id, newBody);
  }

  @action
  async getMembers(id) {
    const result = await this.client.members.list(id);
    const { members = [] } = result || {};
    this.members = members;
    return members;
  }

  @action
  async createMember(id, member) {
    const body = {
      member,
    };
    await this.client.members.create(id, body);
    return this.updateMemberStatus(id, member, 'accepted');
  }

  @action
  async updateMemberStatus(id, member, status) {
    const body = {
      status,
    };
    return this.client.members.update(id, member, body);
  }

  @action
  async deleteMember(id, member) {
    return this.client.members.delete(id, member);
  }

  @action
  async updateMembers(id, adds, dels) {
    this.isSubmitting = true;
    await Promise.all(adds.map((it) => this.createMember(id, it)));
    return this.submitting(
      Promise.all(dels.map((it) => this.deleteMember(id, it)))
    );
  }

  @action
  async fetchList({
    limit,
    page,
    sortKey,
    sortOrder,
    conditions,
    timeFilter,
    ...filters
  } = {}) {
    this.list.isLoading = true;

    const { tab = 'project', all_projects } = filters;

    const isAdminPage = Boolean(all_projects) && tab !== 'all';

    let fetchedData;

    try {
      // Fetch image from both COS and OpenStack APIs in parallel
      // - imageApi.getImageList returns an object with an `images` array
      // - this.requestList fetches the image list based on newParams and filters
      if (isAdminPage) {
        // Admin page ignores tabs
        fetchedData = await this.fetchListFromSources();
      } else {
        switch (tab) {
          case 'project': {
            fetchedData = await this.fetchListFromSources(
              { project: this.currentProjectName },
              { owner: this.currentProjectId }
            );
            break;
          }
          case 'public': {
            fetchedData = await this.fetchListFromSources(
              { visibility: 'public' },
              { visibility: 'public' }
            );
            break;
          }
          case 'all': {
            const [
              fetchedByProject,
              fetchedByVisibilityPublic,
              fetchedByVisibilityShared,
            ] = await Promise.all([
              this.fetchListFromSources(
                { project: this.currentProjectName },
                { owner: this.currentProjectId }
              ),
              this.fetchListFromSources(
                { visibility: 'public' },
                { visibility: 'public' }
              ),
              this.fetchListFromSources(
                { visibility: 'shared' },
                { visibility: 'shared' }
              ),
            ]);

            fetchedData = {
              cosImages: this.dedupeById([
                ...(fetchedByProject.cosImages || []),
                ...(fetchedByVisibilityPublic.cosImages || []),
                ...(fetchedByVisibilityShared.cosImages || []),
              ]),
              originImages: this.dedupeById([
                ...(fetchedByProject.originImages || []),
                ...(fetchedByVisibilityPublic.originImages || []),
                ...(fetchedByVisibilityShared.originImages || []),
              ]),
            };
            break;
          }
          default: {
            // fallback if tab is missing/unknown
            fetchedData = { cosImages: [], originImages: [] };
          }
        }
      }
    } catch (error) {
      this.list.isLoading = false;
      throw error;
    }

    let processedData = this.mergeData(
      fetchedData.originImages,
      fetchedData.cosImages
    );

    // Sort the list so that items still in processing appear first
    processedData = processedData.sort((a, b) => {
      const aProcessing = a.imageStatus?.isProcessing ? 1 : 0;
      const bProcessing = b.imageStatus?.isProcessing ? 1 : 0;

      return bProcessing - aProcessing;
    });

    this.list.update({
      data: processedData,
      total: processedData.length || 0,
      limit: Number(limit) || 10,
      page: Number(page) || 1,
      sortKey,
      sortOrder,
      filters,
      timeFilter,
      isLoading: false,
      ...(this.list.silent ? {} : { selectedRowKeys: [] }),
    });

    return processedData;
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

  @action
  async fetchDetail(params = {}) {
    const { id, silent } = params;

    if (!silent) {
      this.isLoading = true;
    }

    try {
      // If the list is empty, fetch it first
      let items = this.list.data;
      if (!items || items.length === 0) {
        items = await this.fetchList();
      }

      const item = items.find((it) => it.id === id || it.imageId === id);

      if (item) {
        this.detail = item;
      } else {
        // If not found, return `false`
        this.detail = false;
      }
    } catch (error) {
      console.error('Error fetching image detail:', error);
      this.detail = {};
    } finally {
      this.isLoading = false;
    }
  }
}

const cosImageStore = new CosImageStore();
export default cosImageStore;
