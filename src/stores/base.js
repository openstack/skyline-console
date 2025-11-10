// Copyright 2021 99cloud
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { get } from 'lodash';
import { action, observable } from 'mobx';
import client from 'client';
import List from 'stores/base-list';
import globalProjectMapStore from 'stores/project';
import globalRootStore from 'stores/root';

export default class BaseStore {
  list = new List();

  @observable
  detail = {};

  @observable
  isLoading = true;

  @observable
  isSubmitting = false;

  get client() {
    return {};
  }

  get skylineClient() {
    return client.skyline;
  }

  get responseKey() {
    return this.client.responseKey;
  }

  get listResponseKey() {
    return `${this.responseKey}s`;
  }

  get needGetProject() {
    return true;
  }

  get currentUser() {
    return globalRootStore.user || {};
  }

  get currentProjectId() {
    return globalRootStore.projectId;
  }

  get currentProjectName() {
    return globalRootStore.projectName;
  }

  get hasAdminRole() {
    return globalRootStore.hasAdminRole;
  }

  get enableBilling() {
    return globalRootStore.enableBilling;
  }

  get mapper() {
    // update response items;
    // eslint-disable-next-line no-unused-vars
    return (data, allProjects, originFilters) => data;
  }

  get mapperBeforeFetchProject() {
    return (data) => data;
  }

  get filterByApi() {
    return false;
  }

  get paramsFunc() {
    if (this.filterByApi) {
      return (params) => params;
    }
    return (params) => {
      const reservedKeys = [
        'all_data',
        'all_projects',
        'device_id',
        'network_id',
        'floating_network_id',
        'start_at_gt',
        'start_at_lt',
        'binary',
        'fixed_ip_address',
        'device_owner',
        'project_id',
        'type',
        'sort',
        'security_group_id',
        'id',
        'security_group_id',
        'owner_id',
        'status',
        'fingerprint',
        'resource_types',
        'floating_ip_address',
        'uuid',
        'loadbalancer_id',
        'ikepolicy_id',
        'ipsecpolicy_id',
        'endpoint_id',
        'peer_ep_group_id',
        'local_ep_group_id',
        'vpnservice_id',
        'volume_id',
      ];
      const newParams = {};
      Object.keys(params).forEach((key) => {
        if (reservedKeys.indexOf(key) >= 0) {
          newParams[key] = params[key];
        }
      });
      return newParams;
    };
  }

  get paramsFuncPage() {
    return (params) => {
      const { current, ...rest } = params;
      return rest;
    };
  }

  get listFilterByProject() {
    // use it for neutron api
    return false;
  }

  get fetchListByLimit() {
    return false;
  }

  get markerKey() {
    return 'id';
  }

  get listWithDetail() {
    return false;
  }

  get isSubResource() {
    return false;
  }

  getFatherResourceId = (params) => params.id;

  detailFetchByClient(resourceParams, params) {
    const { id } = resourceParams;
    if (!this.isSubResource) {
      return this.client.show(id, params);
    }
    const fatherId = this.getFatherResourceId(resourceParams);
    return this.client.show(fatherId, id, params);
  }

  listFetchByClient(params, originParams) {
    if (!this.isSubResource) {
      return this.listWithDetail
        ? this.client.listDetail(params)
        : this.client.list(params);
    }
    const fatherId = this.getFatherResourceId(originParams);
    return this.client.list(fatherId, params);
  }

  getItemProjectId(item) {
    return (
      item.project_id ||
      item.tenant_id ||
      item.owner ||
      item.owner_id ||
      item.tenant ||
      item.fingerprint
    );
  }

  itemInCurrentProject = (item, all_projects) => {
    // use for neutron resource in admin project
    if (all_projects) {
      return true;
    }
    const itemProject = globalProjectMapStore.getItemProjectId(item);
    const { shared, visibility, is_public } = item;
    return (
      itemProject === this.currentProjectId ||
      is_public ||
      shared ||
      visibility === 'public'
    );
  };

  @action
  setModule(module) {
    this.module = module;
  }

  @action
  submitting = (promise) => {
    this.isSubmitting = true;

    setTimeout(() => {
      promise
        .catch(() => {})
        .finally(() => {
          this.isSubmitting = false;
        });
    }, 500);

    return promise;
  };

  // eslint-disable-next-line no-unused-vars
  async listDidFetch(items, allProjects, filters) {
    return items;
  }

  // eslint-disable-next-line no-unused-vars
  async detailDidFetch(item, all_projects, params) {
    return item;
  }

  async listDidFetchProject(items, all_projects) {
    if (!this.needGetProject) {
      return items;
    }
    if (!all_projects || !this.hasAdminRole) {
      return items;
    }
    const projectIds = [];
    items.forEach((item) => {
      const projectId = globalProjectMapStore.getItemProjectId(item);
      const projectName = globalProjectMapStore.getItemProjectName(item);
      if (!projectName && projectId && projectIds.indexOf(projectId) < 0) {
        projectIds.push(projectId);
      }
    });
    if (projectIds.length === 0) {
      return items;
    }
    try {
      const results = await Promise.all(
        projectIds.map((id) => globalProjectMapStore.fetchProjectDetail({ id }))
      );
      items.forEach((item) => {
        const projectId = globalProjectMapStore.getItemProjectId(item);
        if (projectId && projectIds.indexOf(projectId) >= 0) {
          const project = results.find((it) => it.id === projectId);
          item.project_name = project ? project.name || '-' : '-';
        }
      });
    } catch (e) {
      return items;
    }

    return items;
  }

  updateMarkerParams = (limit, marker) => {
    return {
      limit,
      marker,
    };
  };

  async requestListByMarker(params, limit, marker) {
    const markerParams = this.updateMarkerParams(limit, marker);
    const newParams = {
      ...params,
      ...markerParams,
    };
    return this.listFetchByClient(newParams);
  }

  async requestListAllByLimit(params, limit) {
    let marker = '';
    let hasNext = true;
    let data = [];
    while (hasNext) {
      // eslint-disable-next-line no-await-in-loop
      const result = await this.requestListByMarker(params, limit, marker);
      const items = this.getListDataFromResult(result);
      data = [...data, ...items];
      if (data.length >= limit) {
        marker = this.parseMarker(items, result, data);
        if (!marker) {
          // eslint-disable-next-line no-console
          console.log('parse marker error!');
          hasNext = false;
        }
      } else {
        hasNext = false;
      }
    }
    return data;
  }

  async requestListAll(params, originParams) {
    const result = await this.listFetchByClient(params, originParams);
    return this.getListDataFromResult(result);
  }

  async requestList(params, originParams) {
    const data = !this.fetchListByLimit
      ? await this.requestListAll(params, originParams)
      : await this.requestListAllByLimit(params, 100);
    return data;
  }

  // eslint-disable-next-line no-unused-vars
  async requestListByPage(params, page, originParams) {
    const data = await this.listFetchByClient(params, originParams);
    return data;
  }

  // eslint-disable-next-line no-unused-vars
  updateUrl = (url, params) => url;

  // eslint-disable-next-line no-unused-vars
  updateParamsSortPage = (params, sortKey, sortOrder) => {};

  // eslint-disable-next-line no-unused-vars
  updateParamsSort = (params, sortKey, sortOrder) => {};

  @action
  async pureFetchList({
    limit,
    page,
    sortKey,
    sortOrder,
    conditions,
    timeFilter,
    ...filters
  } = {}) {
    // todo: no page, no limit, fetch all
    // Destruct fields such as `tab` and `tabs` because those properties are only used
    // by the frontend, and will lead to 400 Bad Request error when making API requests
    // because they are unrecognized by the API server.
    const { tab, all_projects, ...rest } = filters;
    const params = { ...rest };
    if (all_projects) {
      if (!this.listFilterByProject) {
        params.all_projects = true;
      }
    }
    const allData = await this.requestList(params, {});
    return allData;
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
    // todo: no page, no limit, fetch all
    // Destruct fields such as `tab` and `tabs` because those properties are only used
    // by the frontend, and will lead to 400 Bad Request error when making API requests
    // because they are unrecognized by the API server.
    const { tab, all_projects, ...rest } = filters;
    const params = { ...rest };
    this.updateParamsSort(params, sortKey, sortOrder);
    if (all_projects) {
      if (!this.listFilterByProject) {
        params.all_projects = true;
      }
    }
    const newParams = this.paramsFunc(params);
    const allData = await this.requestList(newParams, filters);
    const allDataNew = allData.map((it) =>
      this.mapperBeforeFetchProject(it, filters)
    );
    const data = allDataNew.filter((item) => {
      if (!this.listFilterByProject) {
        return true;
      }
      return this.itemInCurrentProject(item, all_projects);
    });
    // const items = data.map(this.mapper);
    let newData = await this.listDidFetchProject(data, all_projects);
    try {
      newData = await this.listDidFetch(newData, all_projects, filters);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e);
    }
    newData = newData.map((d) => this.mapper(d, all_projects, filters));
    this.list.update({
      data: newData,
      total: newData.length || 0,
      limit: Number(limit) || 10,
      page: Number(page) || 1,
      sortKey,
      sortOrder,
      filters,
      timeFilter,
      isLoading: false,
      ...(this.list.silent ? {} : { selectedRowKeys: [] }),
    });

    return newData;
  }

  // eslint-disable-next-line no-unused-vars
  parseMarker(data, result, allData, params) {
    return data.length === 0 ? '' : get(data[data.length - 1], this.markerKey);
  }

  @action
  updateMarker(data, page, result, allData, params) {
    const marker = this.parseMarker(data, result, allData, params);
    if (page === 1) {
      this.list.markers = [marker];
    } else {
      this.list.markers[page - 1] = marker;
    }
  }

  getMarker(page) {
    return page === 1 ? '' : this.list.markers[page - 2];
  }

  getDetailParams = () => undefined;

  getListDataFromResult = (result) =>
    this.listResponseKey ? get(result, this.listResponseKey, []) : result;

  // eslint-disable-next-line no-unused-vars
  async getCountForPage(newParams, newData, all_projects, result, params) {
    return {};
  }

  // eslint-disable-next-line no-unused-vars
  getOtherInfo = (result) => {};

  async buildMarkers(params, page, filters, all_projects) {
    if (page <= 0 || this.list.markers.length >= page) {
      return;
    }

    await this.buildMarkers(params, page - 1, filters, all_projects);

    const marker = this.getMarker(page);
    if (marker) {
      params.marker = marker;
    }

    const newParams = this.paramsFuncPage(params, all_projects);
    const result = await this.requestListByPage(newParams, page, filters);
    const allData = this.getListDataFromResult(result);

    this.updateMarker(allData, page, result, allData, params);
  }

  @action
  async fetchListByPage({
    limit = 10,
    page = 1,
    sortKey,
    sortOrder,
    conditions,
    timeFilter,
    ...filters
  } = {}) {
    this.list.isLoading = true;
    // todo: no page, no limit, fetch all
    // Destruct fields such as `tab` and `tabs` because those properties are only used
    // by the frontend, and will lead to 400 Bad Request error when making API requests
    // because they are unrecognized by the API server.
    const { tab, all_projects, ...rest } = filters;
    const params = { limit, ...rest, current: page };
    this.updateParamsSortPage(params, sortKey, sortOrder);
    if (all_projects) {
      if (!this.listFilterByProject) {
        params.all_projects = true;
      }
    }

    await this.buildMarkers({ ...params }, page - 1, filters, all_projects);

    const marker = this.getMarker(page);
    if (marker) {
      params.marker = marker;
    }
    const newParams = this.paramsFuncPage(params, all_projects);
    const result = await this.requestListByPage(newParams, page, filters);
    const allData = this.getListDataFromResult(result);

    const getActualTotalCount = async () => {
      try {
        const unlimitedResult = await this.requestListByPage(
          {
            ...newParams,
            marker: undefined,
            limit: 9999,
          },
          page,
          filters
        );
        const totalData = this.getListDataFromResult(unlimitedResult);
        return totalData.length;
      } catch {
        return 0;
      }
    };
    const actualTotalCount = await getActualTotalCount();

    this.updateMarker(allData, page, result, allData, params);
    const allDataNew = allData.map(this.mapperBeforeFetchProject);
    let newData = await this.listDidFetchProject(allDataNew, all_projects);
    newData = await this.listDidFetch(newData, all_projects, filters);
    newData = newData.map((d) => this.mapper(d, all_projects, filters));
    let count;
    let total;
    if (result.count || result.total) {
      count = result.count || result.total;
    } else {
      const totalResult = await this.getCountForPage(
        newParams,
        newData,
        all_projects,
        result,
        params
      );
      const { count: retCount, total: retTotal } = totalResult;
      count = retCount;
      total = retTotal;
    }
    const others = this.getOtherInfo(result);
    this.list.update({
      data: newData,
      limit: Number(limit) || 10,
      page: Number(page) || 1,
      sortKey,
      sortOrder,
      filters,
      timeFilter,
      isLoading: false,
      total: actualTotalCount || count || total || newData?.length || 0,
      ...(this.list.silent ? {} : { selectedRowKeys: [] }),
      ...others,
    });

    return newData;
  }

  async pureFetchDetail({ id }) {
    const result = await this.client.show(id);
    return result[this.responseKey];
  }

  @action
  async fetchDetail(params) {
    const { all_projects, silent, ...rest } = params || {};
    if (!silent) {
      this.isLoading = true;
    }
    const result = await this.detailFetchByClient(
      rest,
      this.getDetailParams({ all_projects }),
      params
    );
    const originData = get(result, this.responseKey) || result;
    const item = this.mapperBeforeFetchProject(originData, rest, true);
    try {
      const newItem = await this.detailDidFetch(item, all_projects, rest);
      const detail = this.mapper(newItem, all_projects, rest);
      this.detail = detail;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e);
      this.detail = item;
    }
    this.isLoading = false;
    return this.detail;
  }

  @action
  setSelectRowKeys(key, selectedRowKeys) {
    this[key] && this[key].selectedRowKeys.replace(selectedRowKeys);
  }

  @action
  create(data) {
    const body = {};
    body[this.responseKey] = data;
    return this.submitting(this.client.create(body));
  }

  @action
  edit({ id }, newObject) {
    const body = {};
    body[this.responseKey] = newObject;
    return this.submitting(this.client.update(id, body));
  }

  @action
  update({ id }, newObject) {
    const body = {};
    body[this.responseKey] = newObject;
    return this.submitting(this.client.update(id, body));
  }

  @action
  patch({ id }, newObject) {
    return this.submitting(this.client.patch(id, newObject));
  }

  @action
  delete = ({ id }) => this.submitting(this.client.delete(id));

  @action
  batchDelete(rowKeys) {
    return this.submitting(
      Promise.all(
        rowKeys.map((name) => {
          const item = this.list.data.find((_item) => _item.name === name);
          const { id } = item;
          return this.client.delete(id);
        })
      )
    );
  }

  @action
  clearData() {
    this.list.reset();
    this.detail = {};
  }
}
