import { action, observable } from 'mobx';
import client from 'client';
import { volumeApi } from 'src/apis/volumeApi';
import BaseStore from 'stores/base';
import globalVolumeTypeStore from 'stores/cinder/volume-type';

export class CosVolumeStore extends BaseStore {
  @observable
  volumeTypes = [];

  @observable
  originalVolumeTypes = [];

  @observable
  cinderServiceOptions = [];

  @observable
  quotaSet = {};

  @observable
  volumeTypeForCreate = '';

  @observable
  volumeSizeForCreate = 0;

  @observable
  volumeCountForCreate = 1;

  @observable
  isVolumeCreating = false;

  @observable
  error = null;

  get client() {
    return client.cinder.volumes;
  }

  get transferClient() {
    return client.cinder.volumeTransfers;
  }

  get quotaClient() {
    return client.cinder.quotaSets;
  }

  get zoneClient() {
    return client.cinder.azones;
  }

  listFetchByClient(params, originParams) {
    const { recycle } = originParams;
    if (recycle) {
      return this.client.listDetail(params);
    }
    return this.skylineClient.extension.volumes(params);
  }

  get mapper() {
    const { updateVolume } = require('resources/cinder/volume');
    return (volume) => updateVolume(volume);
  }

  get paramsFunc() {
    return (params) => {
      const { serverId, ...rest } = params;
      return rest;
    };
  }

  get mergeData() {
    return (originVolumes, cosVolumes) => {
      return cosVolumes.map((cosVolume) => {
        const matchedVolume = originVolumes.find(
          (volume) => volume.id === cosVolume.id
        );
        return {
          volumeId: cosVolume?.id,
          volumeName: cosVolume?.name,
          volumeType: cosVolume?.type,
          volumeDiskTag: cosVolume?.diskTag,
          volumeAttachedTo: cosVolume?.attachedTo,
          volumeBootable: cosVolume?.bootable,
          volumeShared: cosVolume?.shared,
          volumeSize: cosVolume?.sizeMiB,
          volumeCreatedAt: cosVolume?.createdAt,
          volumeStatus: cosVolume?.status,
          ...matchedVolume,
        };
      });
    };
  }

  updateParamsSortPage = (params, sortKey, sortOrder) => {
    const { recycle } = params;
    if (sortKey && sortOrder) {
      const dirs = sortOrder === 'descend' ? 'desc' : 'asc';
      if (recycle) {
        params.sort = `${sortKey}:${dirs}`;
      } else {
        params.sort_keys = sortKey;
        params.sort_dirs = sortOrder === 'descend' ? 'desc' : 'asc';
      }
    }
  };

  updateParamsSort = this.updateParamsSortPage;

  async listDidFetch(items, _, filters) {
    if (items.length === 0) {
      return items;
    }
    const { serverId } = filters;
    return !serverId
      ? items
      : items.filter(
          (it) =>
            it.attachments.length > 0 &&
            it.attachments[0].server_id === serverId
        );
  }

  async detailDidFetch(item, all_projects) {
    const { id } = item;
    try {
      const result = await this.fetchList({ uuid: id, all_projects });
      item.itemInList = result[0];
      item.attachmentsContrib = result[0].attachments;
    } catch (e) {}
    const { snapshot_id } = item;
    if (snapshot_id) {
      const snapshot = await client.cinder.snapshots.show(snapshot_id);
      item.snapshot = snapshot.snapshot;
    }
    return item;
  }

  @action
  async fetchQuota() {
    const result = await this.quotaClient.show(this.currentProjectId, {
      usage: 'True',
    });
    this.quotaSet = result.quota_set;
  }

  @action
  async fetchAvailabilityZoneList() {
    const result = await this.zoneClient.list();
    this.availabilityZones = result.availabilityZoneInfo;
  }

  @action
  async operation(id, data, key) {
    const body = { [key]: data };
    return this.submitting(this.client.action(id, body));
  }

  @action
  async migrate(id, data) {
    return this.operation(id, data, 'os-migrate_volume');
  }

  @action
  async uploadImage(id, data) {
    return this.operation(id, data, 'os-volume_upload_image');
  }

  @action
  revert(id, data) {
    return this.operation(id, data, 'revert');
  }

  @action
  extendSize(id, data) {
    return this.operation(id, data, 'os-extend');
  }

  @action
  retype(id, data) {
    return this.operation(id, data, 'os-retype');
  }

  @action
  resetStatus(id, data) {
    return this.operation(id, data, 'os-reset_status');
  }

  @action
  changeBootable(id, data) {
    return this.operation(id, data, 'os-set_bootable');
  }

  @action
  update(id, data) {
    const body = { [this.responseKey]: data };
    return this.submitting(this.client.update(id, body));
  }

  @action
  softDelete(id, data) {
    return this.operation(id, data, 'os-recycle');
  }

  @action
  async cascadeDelete({ id }) {
    const params = {
      cascade: true,
    };
    return this.submitting(this.client.delete(id, null, params));
  }

  restore(id) {
    return this.operation(id, {}, 'os-restore-recycle');
  }

  @action
  createTransfer(data) {
    const body = { transfer: data };
    return this.submitting(this.transferClient.create(body));
  }

  @action
  cancelTransfer({ id }) {
    return this.submitting(this.transferClient.list()).then((resData) => {
      const findObj = (resData.transfers || []).find((s) => s.volume_id === id);
      return this.submitting(this.transferClient.delete(findObj.id));
    });
  }

  @action
  acceptVolumeTransfer(transfer_id, data) {
    const body = { accept: data };
    return this.submitting(this.transferClient.accept(transfer_id, body));
  }

  @action
  async fetchVolumeTypes(params) {
    const data = await globalVolumeTypeStore.fetchList(params);
    this.volumeTypes = data.map((it) => ({
      label: it.name,
      value: it.id,
    }));
    this.originalVolumeTypes = data || [];
  }

  @action
  setCreateVolumeSize(size = 0) {
    this.volumeSizeForCreate = size;
  }

  @action
  setCreateVolumeType(type = '') {
    this.volumeTypeForCreate = type;
  }

  @action
  setCreateVolumeCount(count = 1) {
    this.volumeCountForCreate = count;
  }

  @action
  setCreateVolumeInfo({ size = 0, type = '', count = 1 } = {}) {
    this.setCreateVolumeSize(size);
    this.setCreateVolumeType(type);
    this.setCreateVolumeCount(count);
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

    const { tab, all_projects, ...rest } = filters;

    const params = { limit, ...rest, current: page };

    this.updateParamsSortPage(params, sortKey, sortOrder);

    if (all_projects) {
      if (!this.listFilterByProject) {
        params.all_projects = true;
      }
    }

    const newParams = this.paramsFuncPage(params, all_projects);

    let processedData = [];
    let others;

    try {
      // Fetch volumes from both COS and OpenStack APIs in parallel
      // - volumeApi.getVolumeList returns an object with an `images` array
      // - this.requestListByPage fetches the volume list based on newParams and filters
      const isAdminPage = Boolean(all_projects);
      const [{ volumes: cosVolumes }, originVolumes] = await Promise.all([
        volumeApi.getVolumeList({
          pageSize: 9999,
          pageNum: 1,
          // If admin page, don't filter by project
          project: isAdminPage ? undefined : this.currentProjectName,
        }),
        this.requestList(newParams, filters),
      ]);

      const cinderVolumes = this.getListDataFromResult(originVolumes);
      others = this.getOtherInfo(originVolumes);

      // Merge COS and Cinder volumes into a single data set
      processedData = this.mergeData(cinderVolumes, cosVolumes).map(
        this.mapperBeforeFetchProject
      );
    } catch (error) {
      throw new Error(error);
    }

    let finalData = await this.listDidFetchProject(processedData, all_projects);

    try {
      finalData = await this.listDidFetch(finalData, all_projects, filters);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }

    // Final mapping & sorting
    finalData = finalData
      .map((item) => this.mapper(item, all_projects, filters))
      .sort((a, b) => {
        const aProcessing = a.volumeStatus?.isProcessing ? 1 : 0;
        const bProcessing = b.volumeStatus?.isProcessing ? 1 : 0;

        return bProcessing - aProcessing;
      });

    this.list.update({
      data: finalData,
      total: finalData?.length || 0,
      limit: Number(limit) || 10,
      page: Number(page) || 1,
      sortKey,
      sortOrder,
      filters,
      timeFilter,
      isLoading: false,
      ...(this.list.silent ? {} : { selectedRowKeys: [] }),
      ...others,
    });

    return finalData;
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
