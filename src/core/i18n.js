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
import _, { isArray } from 'lodash';
import cookie from 'utils/cookie';
import SLI18n from 'utils/translate';
import { setLocalStorageItem } from 'utils/local-storage';

import locales from '../locales';

// shortName: the i18n name in the api
// icon: the icon of switch language in ui
const SUPPORT_LOCALES_ALL = [
  {
    name: 'English',
    value: 'en',
    shortName: 'en',
    icon: 'en',
    momentName: 'en',
  },
  {
    name: '简体中文',
    value: 'zh-hans',
    shortName: 'zh',
    icon: 'zh',
    momentName: 'zhCN',
  },
  {
    name: '한글',
    value: 'ko-kr',
    shortName: 'ko',
    icon: 'ko',
    momentName: 'ko',
  },
  {
    name: 'Türkçe',
    value: 'tr-tr',
    shortname: 'tr',
    icon: 'tr',
    momentName: 'tr',
  },
  {
    name: 'Русский',
    value: 'ru',
    shortname: 'ru',
    icon: 'ru',
    momentName: 'ru',
  },
];

const getDefaultLanguageInConfig = () => {
  const { defaultLanguage } = GLOBAL_VARIABLES;
  const defaultLang = defaultLanguage || 'en';
  const inSupport = SUPPORT_LOCALES_ALL.find((it) => it.value === defaultLang);
  return inSupport ? defaultLang : 'en';
};

const getSupportLanguagesInConfig = () => {
  const { supportLanguages } = GLOBAL_VARIABLES;
  const defaultLang = getDefaultLanguageInConfig();
  const defaultSupportLanguages = [defaultLang];
  if (!supportLanguages || !isArray(supportLanguages)) {
    return defaultSupportLanguages;
  }
  if (!supportLanguages.includes(defaultLang)) {
    return [...supportLanguages, defaultLang];
  }
  return supportLanguages;
};

const SUPPORT_LOCALES = SUPPORT_LOCALES_ALL.filter((it) => {
  const supportLanguages = getSupportLanguagesInConfig();
  return supportLanguages.includes(it.value);
});

const getMomentName = (locale) => {
  const item = SUPPORT_LOCALES_ALL.find((it) => it.value === locale);
  return (item || {}).momentName || 'en';
};

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

  const { defaultLanguage } = GLOBAL_VARIABLES;

  // If not found, the default language is set in config.yaml
  if (!_.find(SUPPORT_LOCALES, { value: currentLocale })) {
    currentLocale = defaultLanguage;
  }

  if (!currentLocals) {
    currentLocals = locales[currentLocale];
  }
  moment.locale(currentLocale);
  return currentLocale;
};

const getLocaleShortName = () => {
  const fullName = getLocale();
  const item = SUPPORT_LOCALES.find((it) => it.value === fullName);
  return item ? item.shortName : fullName;
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
  moment.locale(getMomentName(lang));
  window.location.reload();
  return lang;
};

const isLocaleZh = getLocale() === 'zh-hans';

const init = () => {
  const lang = getLocale();

  if (lang === 'zh-hans') {
    moment.locale('zh-cn', {
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
  } else if (lang === 'tr-tr') {
    moment.locale('tr', {
      months:
        'Ocak_Şubat_Mart_Nisan_Mayıs_Haziran_Temmuz_Ağustos_Eylül_Ekim_Kasım_Aralık'.split(
          '_'
        ),
      monthsShort: 'Oca_Şub_Mar_Nis_May_Haz_Tem_Ağu_Eyl_Eki_Kas_Ara'.split('_'),
      weekdays: 'Pazar_Pazartesi_Salı_Çarşamba_Perşembe_Cuma_Cumartesi'.split(
        '_'
      ),
      weekdaysShort: 'Paz_Pzt_Sal_Çar_Per_Cum_Cmt'.split('_'),
      weekdaysMin: 'Pz_Pt_Sa_Ça_Pe_Cu_Ct'.split('_'),
      meridiem(hours, minutes, isLower) {
        if (hours < 12) {
          return isLower ? 'öö' : 'ÖÖ';
        }
        return isLower ? 'ös' : 'ÖS';
      },
      meridiemParse: /öö|ÖÖ|ös|ÖS/,
      isPM(input) {
        return input === 'ös' || input === 'ÖS';
      },
      longDateFormat: {
        LT: 'HH:mm',
        LTS: 'HH:mm:ss',
        L: 'DD.MM.YYYY',
        LL: 'D MMMM YYYY',
        LLL: 'D MMMM YYYY HH:mm',
        LLLL: 'dddd, D MMMM YYYY HH:mm',
      },
      calendar: {
        sameDay: '[bugün saat] LT',
        nextDay: '[yarın saat] LT',
        nextWeek: '[gelecek] dddd [saat] LT',
        lastDay: '[dün] LT',
        lastWeek: '[geçen] dddd [saat] LT',
        sameElse: 'L',
      },
      relativeTime: {
        future: '%s sonra',
        past: '%s önce',
        s: '1 saniye',
        ss: '%d saniye',
        m: '1 dakika',
        mm: '%d dakika',
        h: '1 saat',
        hh: '%d saat',
        d: '1 gün',
        dd: '%d gün',
        w: '1 hafta',
        ww: '%d hafta',
        M: '1 ay',
        MM: '%d ay',
        y: '1 yıl',
        yy: '%d yıl',
      },
    });
  } else if (lang === 'ko-kr') {
    // korean const option
    moment.locale('ko', {
      relativeTime: {
        s: '1초',
        ss: '%d초',
        m: '1분',
        mm: '%d분',
        h: '1시간',
        hh: '%d시간',
        d: '1일',
        dd: '%d일',
        M: '1개월',
        MM: '%d개월',
        y: '1년',
        yy: '%d년',
        past: '%s 전',
        future: '%s 후',
      },
    });
  } else if (lang === 'ru') {
    moment.locale('ru', {
      months:
        'Январь_Февраль_Март_Апрель_Май_Июнь_Июль_Август_Сентябрь_Октябрь_Ноябрь_Декабрь'.split(
          '_'
        ),
      monthsShort: 'Янв_Фев_Мрт_Апр_Май_Июн_Июл_Авг_Сен_Окт_Нбр_Дек'.split('_'),
      weekdays:
        'Воскресенье_Понедельник_Вторник_Среда_Четверг_Пятница_Суббота'.split(
          '_'
        ),
      weekdaysShort: 'Пон_Втор_Сред_Четв_Пятн_Субб_Воскр'.split('_'),
      weekdaysMin: 'Пн_Вт_Ср_Чт_Пт_Сб_Вс'.split('_'),
      meridiem(hours, minutes, isLower) {
        if (hours < 12) {
          return isLower ? 'ночи' : 'Ночи';
        }
        return isLower ? 'дня' : 'Дня';
      },
      meridiemParse: /ночи|Ночи|дня|Дня/,
      isPM(input) {
        return input === 'дня' || input === 'Дня';
      },
      longDateFormat: {
        LT: 'HH:mm',
        LTS: 'HH:mm:ss',
        L: 'DD.MM.YYYY',
        LL: 'D MMMM YYYY',
        LLL: 'D MMMM YYYY HH:mm',
        LLLL: 'dddd, D MMMM YYYY HH:mm',
      },
      calendar: {
        sameDay: '[сегодняшнее время] LT',
        nextDay: '[завтрашнее время] LT',
        nextWeek: '[будущее] dddd [время] LT',
        lastDay: '[вчера] LT',
        lastWeek: '[прошло] dddd [час] LT',
        sameElse: 'L',
      },
      relativeTime: {
        future: '%s позже',
        past: '%s назад',
        s: '1 секунда',
        ss: '%d секунд',
        m: '1 минута',
        mm: '%d минут',
        h: '1 час',
        hh: '%d часов',
        d: '1 день',
        dd: '%d дней',
        w: '1 неделя',
        ww: '%d недель',
        M: '1 месяц',
        MM: '%d месяцев',
        y: '1 год',
        yy: '%d лет',
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
init();
window.t = t;

export default {
  getLocale,
  setLocale,
  loadLocales,
  init,
  t,
  isLocaleZh,
  getLocaleShortName,
  SUPPORT_LOCALES,
};
