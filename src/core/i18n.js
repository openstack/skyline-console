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

import moment from 'moment';
import 'moment/locale/zh-cn';
import _ from 'lodash';
import cookie from 'utils/cookie';
import SLI18n from 'utils/translate';
import { setLocalStorageItem } from 'utils/local-storage';
import locales from '../locales';

const SUPPORT_LOCALES = [
  {
    name: 'English',
    value: 'en',
  },
  {
    name: '简体中文',
    value: 'zh-cn',
  },
];

const intl = new SLI18n();

let currentLocals = null;

// const getLocaleFromStorage = () => {
//   const value = getLocalStorageItem('lang');
//   return value || 'en';
// };

const setLocaleToStorage = (value) => {
  setLocalStorageItem('lang', value);
};

const getLocale = () => {
  let currentLocale = intl.determineLocale({
    urlLocaleKey: 'lang',
    cookieLocaleKey: 'lang',
    localStorageLocaleKey: 'lang',
  });

  // 如果没找到，则默认为汉语
  if (!_.find(SUPPORT_LOCALES, { value: currentLocale })) {
    currentLocale = 'zh-cn';
    // currentLocale = 'en';
  }

  if (!currentLocals) {
    currentLocals = locales[currentLocale];
  }
  moment.locale(currentLocale);
  return currentLocale;
};

const loadLocales = () => {
  const currentLocale = getLocale();
  return intl.init({
    currentLocale,
    locales,
    fallbackLocale: 'en',
  });
};

const setLocale = (lang) => {
  setLocaleToStorage(lang);
  cookie('lang', lang);
  moment.locale(lang);
  window.location.reload();
  return lang;
};

const isLocaleZh = getLocale() === 'zh-cn';

const init = () => {
  const lang = getLocale();

  if (lang === 'zh') {
    moment.locale('zh', {
      relativeTime: {
        s: '1秒',
        ss: '%d秒',
        m: '1分钟',
        mm: '%d分钟',
        h: '1小时',
        hh: '%d小时',
        d: '1天',
        dd: '%d天',
        M: '1个月',
        MM: '%d个月',
        y: '1年',
        yy: '%d年',
        past: '%s前',
        future: '在%s后',
      },
    });
  }

  return { locales };
};

// const localeGet = (key, options) => {
//   if (!currentLocals) {
//     getLocale();
//   }
//   console.log(key, options);
//   return currentLocals[key] || key;
// };

const t = (key, options) => intl.get(key, options);

t.html = (key, options) => intl.getHTML(key, options);

loadLocales();
window.t = t;

export default {
  getLocale,
  setLocale,
  loadLocales,
  init,
  t,
  isLocaleZh,
};
