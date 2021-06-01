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

import { get, isArray } from 'lodash';
import { action, observable } from 'mobx';
import { keystoneBase } from 'utils/constants';
import List from './base-list';
import globalProjectMapStore from './project';

export default class BaseStore {
  list = new List();

  @observable
  detail = {};

  @observable
  isLoading = true;

  @observable
  isSubmitting = false;

  get module() {
    return '';
  }

  get apiVersion() {
    return '';
  }

  get responseKey() {
    return '';
  }

  get listResponseKey() {
    return `${this.responseKey}s`;
  }

  get needGetProject() {
    return true;
  }

  get mapper() {
    // update response items;
    return (data) => data;
    // return ObjectMapper[this.module] || (data => data);
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
    // use it for nuetron apois
    return false;
  }

  get fetchListByLimit() {
    return false;
  }

  get currentProject() {
    return globals.user.project.id;
  }

  get markerKey() {
    return 'id';
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
      itemProject === this.currentProject ||
      is_public ||
      shared ||
      visibility === 'public'
    );
  };

  getListUrl = () => `${this.apiVersion}/${this.module}`;

  getListDetailUrl = () => '';

  getListPageUrl = () => '';

  getDetailUrl = ({ id }) => `${this.getListUrl()}/${id}`;

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

  async fetchProjectDetail({ id }) {
    return request.get(`${keystoneBase()}/projects/${id}`, {}, null, () =>
      Promise.resolve('error')
    );
  }

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
    if (!all_projects || !globals.user.hasAdminRole) {
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

  async requestListByMarker(url, params, limit, marker) {
    const newParams = {
      ...params,
      limit,
    };
    if (marker) {
      newParams.marker = marker;
    }
    return request.get(url, newParams);
  }

  async requestListAllByLimit(url, params, limit) {
    let marker = '';
    let hasNext = true;
    let datas = [];
    while (hasNext) {
      // eslint-disable-next-line no-await-in-loop
      const result = await this.requestListByMarker(url, params, limit, marker);
      const data = this.getListDataFromResult(result);
      datas = [...datas, ...data];
      if (data.length >= limit) {
        marker = this.parseMarker(data);
        if (!marker) {
          // eslint-disable-next-line no-console
          console.log('parse marker error!');
          hasNext = false;
        }
      } else {
        hasNext = false;
      }
    }
    return datas;
  }

  async requestListAll(url, params) {
    const result = await request.get(url, params);
    return this.getListDataFromResult(result);
  }

  async requestList(url, params) {
    const datas = !this.fetchListByLimit
      ? await this.requestListAll(url, params)
      : await this.requestListAllByLimit(url, params, 100);
    return datas;
  }

  // eslint-disable-next-line no-unused-vars
  async requestListByPage(url, params, page, filters) {
    const datas = await request.get(url, params);
    return datas;
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
    const { tab, all_projects, ...rest } = filters;
    const params = { ...rest };
    if (all_projects) {
      if (!this.listFilterByProject) {
        params.all_projects = true;
      }
    }
    let url = `${this.getListDetailUrl() || this.getListUrl()}?`;
    let othersStr = '';
    Object.keys(params).forEach((item) => {
      if (isArray(params[item])) {
        params[item].forEach((i) => {
          othersStr += `${item}=${i}&`;
        });
      } else {
        othersStr += `${item}=${params[item]}&`;
      }
    });
    url += othersStr.substring(0, othersStr.length - 1);
    const allData = await this.requestList(url);
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
    const { tab, all_projects, ...rest } = filters;
    const params = { ...rest };
    if (all_projects) {
      if (!this.listFilterByProject) {
        params.all_projects = true;
      }
    }
    const newParams = this.paramsFunc(params);
    const url = this.getListDetailUrl(filters) || this.getListUrl(filters);
    const newUrl = this.updateUrl(url, params);
    const allData = await this.requestList(newUrl, newParams, filters);
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
    newData = newData.map(this.mapper);
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
  parseMarker(datas, result) {
    return datas.length === 0
      ? ''
      : get(datas[datas.length - 1], this.markerKey);
  }

  @action
  updateMarker(datas, page, result) {
    const marker = this.parseMarker(datas, result);
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
  async getCountForPage(newParams, all_projects, newDatas) {
    return {};
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
    const { tab, all_projects, ...rest } = filters;
    const params = { limit, ...rest };
    this.updateParamsSortPage(params, sortKey, sortOrder);
    if (all_projects) {
      if (!this.listFilterByProject) {
        params.all_projects = true;
      }
    }

    const marker = this.getMarker(page);
    if (marker) {
      params.marker = marker;
    }
    const url =
      this.getListPageUrl(filters) ||
      this.getListDetailUrl(filters) ||
      this.getListUrl(filters);
    const newUrl = this.updateUrl(url, params);
    const newParams = this.paramsFuncPage(params, all_projects);
    const result = await this.requestListByPage(
      newUrl,
      newParams,
      page,
      filters
    );
    const allData = this.getListDataFromResult(result);
    this.updateMarker(allData, page, result);
    const allDataNew = allData.map(this.mapperBeforeFetchProject);
    let newData = await this.listDidFetchProject(allDataNew, all_projects);
    newData = await this.listDidFetch(newData, all_projects, filters);
    newData = newData.map(this.mapper);
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
    this.list.update({
      data: newData,
      limit: Number(limit) || 10,
      page: Number(page) || 1,
      sortKey,
      sortOrder,
      filters,
      timeFilter,
      isLoading: false,
      total: count || total,
      ...(this.list.silent ? {} : { selectedRowKeys: [] }),
    });

    return newData;
  }

  @action
  async fetchListWithoutDetail({
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
    const { tab, all_projects, ...rest } = filters;
    const params = { ...rest };
    if (all_projects) {
      if (!this.listFilterByProject) {
        params.all_projects = true;
      }
    }
    const newParams = this.paramsFunc(params, all_projects);
    const allData = await this.requestList(this.getListUrl(), newParams);
    const allDataNew = allData.map(this.mapperBeforeFetchProject);
    const data = allDataNew.filter((item) => {
      if (!this.listFilterByProject) {
        return true;
      }
      return this.itemInCurrentProject(item, all_projects);
    });
    // const items = data.map(this.mapper);
    let newData = await this.listDidFetchProject(data, all_projects);
    newData = await this.listDidFetch(newData, all_projects, filters);
    newData = newData.map(this.mapper);
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

  @action
  async fetchDetail({ all_projects, silent, ...rest }) {
    if (!silent) {
      this.isLoading = true;
    }
    const result = await request.get(
      this.getDetailUrl(rest),
      this.getDetailParams({ all_projects })
    );
    const originData = get(result, this.responseKey) || result;
    const item = this.mapperBeforeFetchProject(originData, rest, true);
    try {
      const newItem = await this.detailDidFetch(item, all_projects, rest);
      const detail = this.mapper(newItem);
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
    return this.submitting(request.post(this.getListUrl(), body));
  }

  @action
  update({ id }, newObject, sleepTime) {
    return this.submitting(
      request.post(
        `${this.getDetailUrl({ id })}/action`,
        newObject,
        null,
        null,
        sleepTime
      )
    );
  }

  @action
  edit({ id }, newObject) {
    const body = {};
    body[this.responseKey] = newObject;
    return this.submitting(request.put(this.getDetailUrl({ id }), body));
  }

  @action
  patch({ id }, newObject) {
    return this.submitting(request.patch(this.getDetailUrl({ id }), newObject));
  }

  @action
  delete = ({ id }) =>
    this.submitting(request.delete(this.getDetailUrl({ id })));

  @action
  batchDelete(rowKeys) {
    return this.submitting(
      Promise.all(
        rowKeys.map((name) => {
          const item = this.list.data.find((_item) => _item.name === name);
          return request.delete(this.getDetailUrl(item));
        })
      )
    );
  }

  reject = (res) => {
    this.isSubmitting = false;
    window.onunhandledrejection(res);
  };

  @action
  clearData() {
    this.list.reset();
    this.detail = {};
  }
}
