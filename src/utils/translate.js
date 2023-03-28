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

import React from 'react';
import IntlMessageFormat from 'intl-messageformat';
import escapeHtml from 'escape-html';
import cookie from 'cookie';
import queryParser from 'querystring';
import invariant from 'invariant';
import { getLocalStorageItem } from 'utils/local-storage';
// import * as constants from './constants';
import { merge } from 'lodash';

// eslint-disable-next-line no-extend-native
String.prototype.defaultMessage = function (msg) {
  return this || msg || '';
};

class SLI18n {
  constructor() {
    this.options = {
      currentLocale: null, // Current locale such as 'en'
      locales: {}, // app locale data like {"en":{"key1":"value1"},"zh-hans":{"key1":"值1"}}
      // eslint-disable-next-line no-console
      warningHandler: function warn(...msg) {
        console.warn(...msg);
      }, // ability to accumulate missing messages using third party services
      escapeHtml: true, // disable escape html in variable mode
      // commonLocaleDataUrls: COMMON_LOCALE_DATA_URLS,
      fallbackLocale: null, // Locale to use if a key is not found in the current locale
    };
  }

  /**
   * Get the formatted message by key
   * @param {string} key The string representing key in locale data file
   * @param {Object} variables Variables in message
   * @returns {string} message
   */
  get(key, variables) {
    invariant(key, 'key is required');
    const { locales, currentLocale, formats } = this.options;

    if (!locales || !locales[currentLocale]) {
      this.options.warningHandler(
        `translate locales data "${currentLocale}" not exists.`
      );
      return '';
    }
    let msg = this.getDescendantProp(locales[currentLocale], key);
    if (msg == null || msg === '') {
      if (this.options.fallbackLocale) {
        msg = this.getDescendantProp(locales[this.options.fallbackLocale], key);
        if (msg == null) {
          this.options.warningHandler(
            `translate key "${key}" not defined in ${currentLocale}`
          );
          // this.options.warningHandler(
          //   `translate key "${key}" not defined in ${currentLocale} or the fallback locale, ${this.options.fallbackLocale}`
          // );
          msg = key;
        }
      } else {
        this.options.warningHandler(
          `translate key "${key}" not defined in ${currentLocale}`
        );
        msg = key;
      }
    }
    if (variables) {
      variables = { ...variables };
      // HTML message with variables. Escape it to avoid XSS attack.
      Object.keys(variables).forEach((i) => {
        let value = variables[i];
        if (
          this.options.escapeHtml === true &&
          (typeof value === 'string' || value instanceof String) &&
          value.indexOf('<') >= 0 &&
          value.indexOf('>') >= 0
        ) {
          value = escapeHtml(value);
        }
        variables[i] = value;
      });
    }

    try {
      const msgFormatter = new IntlMessageFormat(msg, currentLocale, formats);
      return msgFormatter.format(variables);
    } catch (err) {
      this.options.warningHandler(
        `translate format message failed for key='${key}'.`,
        err.message
      );
      return msg;
    }
  }

  /**
   * Get the formatted html message by key.
   * @param {string} key The string representing key in locale data file
   * @param {Object} variables Variables in message
   * @returns {React.Element} message
   */
  getHTML(key, variables) {
    const msg = this.get(key, variables);
    if (msg) {
      const el = React.createElement('span', {
        dangerouslySetInnerHTML: {
          __html: msg,
        },
      });
      // when key exists, it should still return element if there's defaultMessage() after getHTML()
      const defaultMessage = () => el;
      return {
        defaultMessage,
        d: defaultMessage,
        ...el,
      };
    }
    return '';
  }

  /**
   * As same as get(...) API
   * @param {Object} options
   * @param {string} options.id
   * @param {string} options.defaultMessage
   * @param {Object} variables Variables in message
   * @returns {string} message
   */
  formatMessage(messageDescriptor, variables) {
    const { id, defaultMessage } = messageDescriptor;
    return this.get(id, variables).defaultMessage(defaultMessage);
  }

  /**
   * As same as getHTML(...) API
   * @param {Object} options
   * @param {string} options.id
   * @param {React.Element} options.defaultMessage
   * @param {Object} variables Variables in message
   * @returns {React.Element} message
   */
  formatHTMLMessage(messageDescriptor, variables) {
    const { id, defaultMessage } = messageDescriptor;
    return this.getHTML(id, variables).defaultMessage(defaultMessage);
  }

  /**
   * Helper: determine user's locale via URL, cookie, localStorage, and browser's language.
   * You may not this API, if you have other rules to determine user's locale.
   * @param {string} options.urlLocaleKey URL's query Key to determine locale. Example: if URL=http://localhost?lang=en, then set it 'lang'
   * @param {string} options.cookieLocaleKey Cookie's Key to determine locale. Example: if cookie=lang:en, then set it 'lang'
   * @param {string} options.localStorageLocaleKey LocalStorage's Key to determine locale such as 'lang'
   * @returns {string} determined locale such as 'en'
   */
  determineLocale(options = {}) {
    return (
      this.getLocaleFromLocalStorage(options) ||
      this.getLocaleFromURL(options) ||
      this.getLocaleFromCookie(options) ||
      this.getLocaleFromBrowser()
    );
  }

  /**
   * Initialize properties and load CLDR locale data according to currentLocale
   * @param {Object} options
   * @param {string} options.currentLocale Current locale such as 'en'
   * @param {string} options.locales App locale data like {"en":{"key1":"value1"},"zh-hans":{"key1":"值1"}}
   * @returns {Promise}
   */
  init(options = {}) {
    invariant(options.currentLocale, 'options.currentLocale is required');
    invariant(options.locales, 'options.locales is required');

    Object.assign(this.options, options);

    this.options.formats = {
      ...this.options.formats,
      // constants.defaultFormats
    };

    return new Promise((resolve) => {
      // init() will not load external common locale data anymore.
      // But, it still return a Promise for backward compatibility.
      resolve();
    });
  }

  /**
   * Get the initial options
   */
  getInitOptions() {
    return this.options;
  }

  /**
   * Load more locales after init
   */
  load(locales) {
    merge(this.options.locales, locales);
  }

  getLocaleFromCookie(options) {
    const { cookieLocaleKey } = options;
    if (cookieLocaleKey) {
      const params = cookie.parse(document.cookie);
      return params && params[cookieLocaleKey];
    }
  }

  getLocaleFromLocalStorage(options) {
    const { localStorageLocaleKey } = options;
    if (localStorageLocaleKey && window.localStorage) {
      return getLocalStorageItem(localStorageLocaleKey);
    }
  }

  getLocaleFromURL(options) {
    const { urlLocaleKey } = options;
    if (urlLocaleKey) {
      const query = window.location.search.split('?');
      if (query.length >= 2) {
        const params = queryParser.parse(query[1]);
        return params && params[urlLocaleKey];
      }
    }
  }

  getDescendantProp(locale, key) {
    if (locale[key]) {
      return locale[key];
    }

    const msg = key
      .split('.')
      .reduce((a, b) => (a !== undefined ? a[b] : a), locale);

    return msg;
  }

  getLocaleFromBrowser() {
    return navigator.language || navigator.userLanguage;
  }
}

export default SLI18n;
