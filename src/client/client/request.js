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

import Axios from 'axios';
import { getLocalStorageItem } from 'utils/local-storage';
import { isEmpty } from 'lodash';
import qs from 'qs';
import { v4 as uuidv4 } from 'uuid';

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'COPY'];
/**
 * @class HttpRequest
 * request with axios
 */
export class HttpRequest {
  constructor() {
    this.request = {};
  }

  goToLoginPage(path) {
    const globalRootStore = require('stores/root').default;
    globalRootStore.goToLoginPage(path);
  }

  handleError(error) {
    const { response } = error;
    if (response) {
      const { status } = response;
      if (status === 401) {
        const currentPath = window.location.pathname;
        if (currentPath.indexOf('login') < 0) {
          this.goToLoginPage(currentPath);
        }
      }
    }
  }

  addRequestId(config) {
    const uuid = uuidv4();
    config.headers['X-Openstack-Request-Id'] = `req-${uuid}`;
  }

  addToken(config) {
    const keystoneToken = getLocalStorageItem('keystone_token') || '';
    if (keystoneToken) {
      config.headers['X-Auth-Token'] = keystoneToken;
    }
  }

  addVersion(config, url) {
    const { getOpenstackApiVersion } = require('./constants');
    const apiVersionMap = getOpenstackApiVersion(url);

    if (apiVersionMap) {
      config.headers[apiVersionMap.key] = apiVersionMap.value;
    }
  }

  updateHeaderByConfig(config) {
    const { options: { headers, isFormData, ...rest } = {} } = config;
    if (!isEmpty(headers)) {
      config.headers = {
        ...config.headers,
        ...headers,
      };
      console.log('new config headers', config.headers);
    }
    if (isFormData) {
      delete config.headers['Content-Type'];
    }
    Object.keys(rest).forEach((key) => {
      config[key] = rest[key];
    });
  }

  updateRequestConfig(config, url) {
    this.addRequestId(config);
    this.addToken(config);
    this.addVersion(config, url);
    this.updateHeaderByConfig(config);
    return config;
  }

  /**
   * @param instance instance of axios
   * @param url request url
   * interceptors includes request & response
   * @returns {void}
   */
  interceptors(instance, url) {
    instance.interceptors.request.use(
      (config) => {
        return this.updateRequestConfig(config, url);
      },
      (err) => Promise.reject(err)
    );

    instance.interceptors.response.use(
      (response) => {
        // request is finished
        const { data, status } = response;
        const disposition = response.headers['content-disposition'] || '';
        const contentType = response.headers['content-type'] || '';
        const { method = 'get' } = response.config || {};
        if (method.toLowerCase() === 'head') {
          return response;
        }
        if (contentType.includes('application/octet-stream')) {
          return response;
        }
        if (disposition.includes('attachment')) {
          return response;
        }
        if (status < 200 || status >= 300) {
          return Promise.reject(data);
        }
        return data;
      },
      (error) => {
        // request is finished
        // eslint-disable-next-line no-console
        console.log('error.response', error.response, error);
        this.handleError(error);
        return Promise.reject(error);
      }
    );
  }

  /**
   * create a new instance of axios with a custom config
   */
  create() {
    const conf = {
      baseURL: '/',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
        'cache-control': 'no-cache',
        pragma: 'no-cache',
      },
    };
    return Axios.create(conf);
  }

  /**
   * @param {Object} obj translated object
   * @returns {Object} trim undefined & null
   */
  omitNil(obj) {
    if (typeof obj !== 'object') return obj;
    return Object.keys(obj).reduce((acc, v) => {
      if (obj[v] !== undefined && obj[v] !== null && obj[v] !== '')
        acc[v] = obj[v];
      return acc;
    }, {});
  }

  /**
   * build request
   * @param {Object} config requests config
   * @returns {Promise} axios instance return promise
   */
  buildRequest(config) {
    const method = config.method ? config.method.toLowerCase() : 'get';
    const options = { ...config };
    // Only get and head, we need to use null for some posts requests
    if (options.params && ['get', 'head'].includes(method)) {
      options.params = this.omitNil(options.params);
      options.paramsSerializer = (p) =>
        qs.stringify(p, { arrayFormat: 'repeat' });
    }
    const instance = this.create();
    this.interceptors(instance, options.url);
    return instance(options);
  }

  generateRequestMap = () => {
    METHODS.forEach((method) => {
      const lowerMethod = method.toLowerCase();
      if (
        lowerMethod === 'get' ||
        lowerMethod === 'head' ||
        lowerMethod === 'copy'
      ) {
        this.request[lowerMethod] = (url, params = {}, options) => {
          return this.buildRequest({
            method: lowerMethod,
            url,
            params,
            options,
          });
        };
      } else {
        this.request[lowerMethod] = (url, data, params, options) => {
          return this.buildRequest({
            method: lowerMethod,
            url,
            data,
            params,
            options,
          });
        };
      }
    });
    this.request.empty = () => {
      return {};
    };
  };
}

const httpRequest = new HttpRequest();
httpRequest.generateRequestMap();
export default httpRequest;
