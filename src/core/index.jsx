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

import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';
import { createBrowserHistory } from 'history';
import { syncHistoryWithStore } from 'mobx-react-router';
import { ConfigProvider } from 'antd';
import globalRootStore from 'stores/root';
import PageLoading from 'components/PageLoading';
import metricDict from 'resources/prometheus/metricDict';
import variables from 'styles/variables.less';
import zhCN from 'antd/es/locale/zh_CN';
import enUS from 'antd/es/locale/en_US';
import koKR from 'antd/es/locale/ko_KR';
import trTR from 'antd/es/locale/tr_TR';
import ruRU from 'antd/es/locale/ru_RU';
import i18n from './i18n';
import App from './App';

window.t = i18n.t;
window.METRICDICT = metricDict;
window.globalCSS = variables;

const store = globalRootStore;
const browserHistory = createBrowserHistory();
const history = syncHistoryWithStore(browserHistory, store.routing);

const antdLanguageMap = {
  en: enUS,
  'zh-hans': zhCN,
  'ko-kr': koKR,
  'tr-tr': trTR,
  ru: ruRU,
};

const getAntdLocale = (locale) => {
  const lang = locale || i18n.getLocale();
  return antdLanguageMap[lang] || enUS;
};

const localeProvider = getAntdLocale(i18n.getLocale());

const render = (component) => {
  ReactDOM.render(
    <Suspense fallback={<PageLoading className="sl-page-loading" />}>
      {/* <>{component}</> */}
      <ConfigProvider locale={localeProvider}>{component}</ConfigProvider>
    </Suspense>,
    document.getElementById('app')
  );
};

const getUser = async (callback) => {
  const currentPath = window.location.pathname;
  if (currentPath.indexOf('/login') < 0) {
    try {
      await store.getUserProfileAndPolicy();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e);
      store.goToLoginPage(currentPath);
    } finally {
      callback && callback();
    }

    return;
  }
  callback && callback();
};
getUser(() => {
  render(<App rootStore={store} history={history} />);
});
