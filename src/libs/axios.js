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
import { getOpenstackApiVersion } from 'client/client/constants';
import Notify from 'components/Notify';
import { isEqual } from 'lodash';
import baseURL from './base-url';

/**
 * @class HttpRequest
 * request with axios
 */
class HttpRequest {
  constructor() {
    // this.CancelToken = Axios.CancelToken;
    this.sameRequestInterval = 1000;
    this.queue = {};
  }

  /**
   * @param url request url
   * delete url from queue
   */
  destroy(url) {
    delete this.queue[url];
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
        const keystoneToken = getLocalStorageItem('keystone_token') || '';
        const apiVersionMap = getOpenstackApiVersion(url);
        if (keystoneToken) {
          config.headers['X-Auth-Token'] = keystoneToken;
        }
        if (apiVersionMap) {
          config.headers[apiVersionMap.key] = apiVersionMap.value;
        }
        return config;
      },
      (err) => Promise.reject(err)
    );

    instance.interceptors.response.use(
      (response) => {
        // request is finished
        this.destroy(url);
        const { data, status } = response;
        const disposition = response.headers['content-disposition'] || '';
        const contentType = response.headers['content-type'] || '';
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
        this.destroy(url);
        if (error.response) {
          const { data, status } = error.response;
          if ([400, 401, 403, 404].includes(status)) {
            const keys = Object.keys(data);
            if (keys.length && data[keys[0]]) {
              Notify.error(data[keys[0]].message || data[keys[0]].toString());
            }
          } else if (status === 500) {
            Notify.error(t('System is busy, please try again later'));
          } else {
            Notify.error(t('System error'));
          }
        }
        return Promise.reject(error.toString());
      }
    );
  }

  /**
   * create a new instance of axios with a custom config
   */
  create() {
    const conf = {
      baseURL,
      timeout: 120000,
      headers: {
        'content-type': 'application/json;charset=utf-8',
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
      if (obj[v] !== undefined && obj[v] !== null) acc[v] = obj[v];
      return acc;
    }, {});
  }

  /**
   * build request
   * @param {Object} config requests config
   * @returns {Promise} axios instance return promise
   */
  request(config) {
    const method = config.method ? config.method.toLowerCase() : 'get';
    const options = { ...config };
    // Only get and head, we need to use null for some posts requests
    if (options.params && ['get', 'head'].includes(method)) {
      options.params = this.omitNil(options.params);
    }

    // prevent request repeat quickly
    if (method !== 'get') {
      const requestInfo = this.queue[options.url];
      const now = Date.now();
      if (
        requestInfo &&
        now - requestInfo.timestamp < this.sameRequestInterval &&
        isEqual(options, requestInfo.options)
      ) {
        Notify.error(t('Please do not request repeat quickly'));
        return Promise.reject(
          new Error(t('Please do not request repeat quickly'))
        );
      }
    }

    const instance = this.create();
    this.interceptors(instance, options.url);
    this.queue[options.url] = {
      instance,
      options,
      timestamp: Date.now(),
    };
    return instance(options);
  }
}

export default new HttpRequest();
