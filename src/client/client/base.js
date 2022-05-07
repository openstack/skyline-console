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

import clientRequest from './request';

export default class BaseClient {
  constructor() {
    this.generateAll();
  }

  getUrl = (url) => {
    if (this.projectInUrl) {
      return url
        ? `${this.baseUrl}/${this.project}/${url}`
        : `${this.baseUrl}/${this.project}`;
    }
    return url ? `${this.baseUrl}/${url}` : `${this.baseUrl}`;
  };

  get enable() {
    return true;
  }

  get request() {
    if (!this.enable) {
      // const emptyFunc = () => {
      //   return Promise.resolve({});
      // };
      const methods = ['get', 'post', 'put', 'delete', 'patch', 'head', 'copy'];
      const req = {};
      methods.forEach((m) => {
        req[m] = this.originRequest.empty;
      });
      return req;
    }
    const request = this.originRequest;
    return {
      get: (url, params, conf) => request.get(this.getUrl(url), params, conf),
      post: (url, data, params, conf) =>
        request.post(this.getUrl(url), data, params, conf),
      put: (url, data, params, conf) =>
        request.put(this.getUrl(url), data, params, conf),
      delete: (url, data, params, conf) =>
        request.delete(this.getUrl(url), data, params, conf),
      patch: (url, data, params, conf) =>
        request.patch(this.getUrl(url), data, params, conf),
      head: (url, params, conf) => request.head(this.getUrl(url), params, conf),
      copy: (url, params, conf) => request.copy(this.getUrl(url), params, conf),
    };
  }

  get originRequest() {
    const { request } = clientRequest;
    return request;
  }

  get params() {
    return [];
  }

  get baseUrl() {
    return '';
  }

  get projectInUrl() {
    return false;
  }

  get project() {
    if (!this.projectInUrl) {
      return '';
    }
    const globalRootStore = require('stores/root').default;
    const { project: { id } = {} } = globalRootStore.user || {};
    return id || '';
  }

  get enabled() {
    return true;
  }

  get resources() {
    return [];
  }

  getListUrl(resourceName) {
    return resourceName;
  }

  getDetailUrl(resourceName, id) {
    if (!id) {
      return resourceName;
    }
    if (!resourceName) {
      return id;
    }
    if (resourceName[resourceName.length - 1] === '/') {
      return `${resourceName.substr(0, resourceName.length - 1)}/${id}`;
    }
    return `${resourceName}/${id}`;
  }

  getSubResourceUrl(resourceName, subResourceName) {
    if (!resourceName) {
      return subResourceName;
    }
    if (!subResourceName) {
      return resourceName;
    }
    if (resourceName[resourceName.length - 1] === '/') {
      return `${resourceName}${subResourceName}`;
    }
    return `${resourceName}/${subResourceName}`;
  }

  getSubResourceUrlById(resourceName, subResourceName, id) {
    if (!subResourceName) {
      return this.getDetailUrl(resourceName, id);
    }
    return `${this.getDetailUrl(resourceName, id)}/${subResourceName}`;
  }

  getSubResourceUrlBySubId(resourceName, subResourceName, id, subId) {
    return `${this.getSubResourceUrlById(
      resourceName,
      subResourceName,
      id
    )}/${subId}`;
  }

  getSubSubResourceListUrl(
    resourceName,
    subResourceName,
    subSubResourceName,
    id,
    subId
  ) {
    return `${this.getSubResourceUrlBySubId(
      resourceName,
      subResourceName,
      id,
      subId
    )}/${subSubResourceName}`;
  }

  getSubSubResourceDetailUrl(
    resourceName,
    subResourceName,
    subSubResourceName,
    id,
    subId,
    subSubId
  ) {
    return `${this.getSubSubResourceListUrl(
      resourceName,
      subResourceName,
      subSubResourceName,
      id,
      subId
    )}/${subSubId}`;
  }

  generateResource = (resourceName, responseKey, enabled = true) => {
    const listUrl = this.getListUrl(resourceName);
    return {
      list: (params, conf) => this.request.get(listUrl, params, conf),
      listDetail: (params, conf) =>
        this.request.get(`${listUrl}/detail`, params, conf),
      show: (id, params, conf) => {
        return this.request.get(
          this.getDetailUrl(resourceName, id),
          params,
          conf
        );
      },
      showDetail: (id, params, conf) => {
        return this.request.get(
          `${this.getDetailUrl(resourceName, id)}/detail`,
          params,
          conf
        );
      },
      create: (data, ...args) => this.request.post(listUrl, data, ...args),
      update: (id, data, ...args) =>
        this.request.put(this.getDetailUrl(resourceName, id), data, ...args),
      patch: (id, data, ...args) =>
        this.request.patch(this.getDetailUrl(resourceName, id), data, ...args),
      delete: (id, ...args) =>
        this.request.delete(this.getDetailUrl(resourceName, id), ...args),
      head: (id, ...args) =>
        this.request.head(this.getDetailUrl(resourceName, id), ...args),
      responseKey,
      enabled,
    };
  };

  generateSubResource = (
    resourceName,
    subResourceName,
    responseKey,
    enabled
  ) => ({
    list: (id, params, ...args) =>
      this.request.get(
        this.getSubResourceUrlById(resourceName, subResourceName, id),
        params,
        ...args
      ),
    listDetail: (id, params, ...args) =>
      this.request.get(
        `${this.getSubResourceUrlById(
          resourceName,
          subResourceName,
          id
        )}/detail`,
        params,
        ...args
      ),
    show: (id, subId, params, ...args) =>
      this.request.get(
        this.getSubResourceUrlBySubId(resourceName, subResourceName, id, subId),
        params,
        ...args
      ),
    create: (id, data, ...args) =>
      this.request.post(
        this.getSubResourceUrlById(resourceName, subResourceName, id),
        data,
        ...args
      ),
    update: (id, subId, data, ...args) =>
      this.request.put(
        this.getSubResourceUrlBySubId(resourceName, subResourceName, id, subId),
        data,
        ...args
      ),
    patch: (id, subId, data, ...args) =>
      this.request.patch(
        this.getSubResourceUrlBySubId(resourceName, subResourceName, id, subId),
        data,
        ...args
      ),
    delete: (id, subId, ...args) =>
      this.request.delete(
        this.getSubResourceUrlBySubId(resourceName, subResourceName, id, subId),
        ...args
      ),
    head: (id, subId, ...args) =>
      this.request.head(
        this.getSubResourceUrlBySubId(resourceName, subResourceName, id, subId),
        ...args
      ),
    responseKey,
    enabled,
  });

  generateSubSonResource = (
    resourceName,
    subResourceName,
    subSubResourceName,
    responseKey
  ) => ({
    list: (id, subId, params, ...args) =>
      this.request.get(
        this.getSubSubResourceListUrl(
          resourceName,
          subResourceName,
          subSubResourceName,
          id,
          subId
        ),
        params,
        ...args
      ),
    show: (id, subId, subSubId, params, ...args) =>
      this.request.get(
        this.getSubSubResourceDetailUrl(
          resourceName,
          subResourceName,
          subSubResourceName,
          id,
          subId,
          subSubId
        ),
        params,
        ...args
      ),
    create: (id, subId, data, ...args) =>
      this.request.post(
        this.getSubSubResourceListUrl(
          resourceName,
          subResourceName,
          subSubResourceName,
          id,
          subId
        ),
        data,
        ...args
      ),
    update: (id, subId, subSubId, data, ...args) =>
      this.request.put(
        this.getSubSubResourceDetailUrl(
          resourceName,
          subResourceName,
          subSubResourceName,
          id,
          subId,
          subSubId
        ),
        data,
        ...args
      ),
    patch: (id, subId, subSubId, data, ...args) =>
      this.request.patch(
        this.getSubSubResourceDetailUrl(
          resourceName,
          subResourceName,
          subSubResourceName,
          id,
          subId,
          subSubId
        ),
        data,
        ...args
      ),
    delete: (id, subId, subSubId, ...args) =>
      this.request.delete(
        this.getSubSubResourceDetailUrl(
          resourceName,
          subResourceName,
          subSubResourceName,
          id,
          subId,
          subSubId
        ),
        ...args
      ),
    head: (id, subId, subSubId, ...args) =>
      this.request.head(
        this.getSubSubResourceDetailUrl(
          resourceName,
          subResourceName,
          subSubResourceName,
          id,
          subId,
          subSubId
        ),
        ...args
      ),
    responseKey,
  });

  setRequest = (url, method, ...restArgs) => {
    const lowerMethod = method.toLowerCase();
    return this.request[lowerMethod](url, ...restArgs);
  };

  generateAll = () => {
    this.resources.forEach((resource) => {
      const {
        name,
        key,
        responseKey,
        enabled,
        subResources = [],
        isResource = true,
        extendOperations = [],
      } = resource;
      const result = isResource
        ? this.generateResource(key, responseKey, enabled)
        : {};
      const realName = name || key;
      extendOperations.forEach((other) => {
        const {
          name: otherName,
          key: otherKey,
          method = 'get',
          isDetail,
          generate,
          url,
        } = other;
        const otherRealName = otherName || otherKey;
        const otherUrl = url && url();
        const otherIsDetail = isResource
          ? isDetail === undefined
            ? true
            : isDetail
          : isDetail === undefined
          ? false
          : isDetail;
        if (generate) {
          result[otherRealName] = generate;
        } else if (otherIsDetail) {
          result[otherRealName] = (id, ...args) => {
            return this.setRequest(
              otherUrl || this.getSubResourceUrlById(key, otherKey, id),
              method,
              ...args
            );
          };
        } else {
          result[otherRealName] = (...args) => {
            return this.setRequest(
              otherUrl || this.getSubResourceUrl(key, otherKey),
              method,
              ...args
            );
          };
        }
      });
      subResources.forEach((sub) => {
        let subResult = {};
        const {
          name: subName,
          key: subKey,
          responseKey: subResponseKey,
          method: subMethod,
          enabled: subEnabled,
          subResources: subSubResources = [],
        } = sub;
        const subRealName = subName || subKey;
        if (!subMethod) {
          subResult = this.generateSubResource(
            key,
            subKey,
            subResponseKey,
            subEnabled
          );
        } else {
          subResult = (id, ...args) => {
            const url = this.getSubResourceUrlById(key, subKey, id);
            return this.setRequest(url, subMethod, ...args);
          };
        }
        subSubResources.forEach((son) => {
          const {
            key: sonKey,
            name: sonName,
            responseKey: sonResponseKey,
          } = son;
          subResult[sonName || sonKey] = this.generateSubSonResource(
            key,
            subKey,
            sonKey,
            sonResponseKey
          );
        });
        result[subRealName] = subResult;
      });
      if (realName) {
        this[realName] = result;
      } else {
        Object.keys(result).forEach((resultKey) => {
          this[resultKey] = result[resultKey];
        });
      }
    });
  };
}
