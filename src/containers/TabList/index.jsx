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

import React, { Component } from 'react';
import { parse } from 'qs';
import classnames from 'classnames';
import { Tabs } from 'antd';
import { isAdminPage } from 'utils/index';
import { getPath, getLinkRender } from 'utils/route-map';
import NotFound from 'components/Cards/NotFound';
import styles from './index.less';

export default class TabList extends Component {
  constructor(props, options = {}) {
    super(props);

    this.options = options;

    this.state = {};
    this.init();
  }

  get routing() {
    return this.props.rootStore.routing;
  }

  get location() {
    return this.props.location || {};
  }

  get isAdminPage() {
    const { pathname } = this.location;
    return isAdminPage(pathname);
  }

  get hasAdminRole() {
    return this.props.rootStore.hasAdminRole;
  }

  get endpoint() {
    return '';
  }

  get checkEndpoint() {
    return false;
  }

  get name() {
    return '';
  }

  get endpointError() {
    return this.checkEndpoint && !this.endpoint;
  }

  getRouteName(routeName) {
    return this.isAdminPage ? `${routeName}Admin` : routeName;
  }

  getRoutePath(routeName, params = {}, query = {}) {
    const realName = this.getRouteName(routeName);
    return getPath({ key: realName, params, query });
  }

  getLinkRender(routeName, value, params = {}, query = {}) {
    const realName = this.getRouteName(routeName);
    return getLinkRender({ key: realName, params, query, value });
  }

  get tabs() {
    const tabs = [
      {
        title: 'tab1',
        key: 'tab1',
        component: null,
      },
      {
        title: 'tab2',
        key: 'tab2',
        component: null,
      },
    ];
    return tabs;
  }

  getTab() {
    const params = parse(this.routing.location.search.slice(1));
    const { tab } = params;
    return tab;
  }

  get tab() {
    if (this.tabs.length === 0) {
      return null;
    }
    const tab = this.getTab();
    const tabItem = this.tabs.find((it) => it.key === tab);
    return tabItem || this.tabs[0];
  }

  handleFetch = (params, refresh) => {
    this.routing.query(params, refresh);
  };

  handleChangeTab = (tab) => {
    // this.setState({
    //   tab
    // });
    this.handleFetch({ tab }, true);
  };

  init() {}

  renderTabComponent(tabItem) {
    const { component, key } = tabItem;
    // return <span>{key}</span>;
    return component ? (
      <tabItem.component {...this.props} tab={this.tab.key} />
    ) : (
      <span key={key}>{key}</span>
    );
  }

  renderTab(tabKey, tabItem) {
    if (tabKey !== tabItem.key) {
      return <Tabs.TabPane tab={tabItem.title} key={tabItem.key} />;
    }
    return (
      <Tabs.TabPane tab={tabItem.title} key={tabItem.key}>
        {this.renderTabComponent(tabItem)}
      </Tabs.TabPane>
    );
  }

  renderTabs() {
    if (!this.tab) {
      return null;
    }
    if (this.endpointError) {
      const link = this.getRoutePath('overview');
      return <NotFound title={this.name} link={link} endpointError />;
    }
    // if (this.tabs.length === 1) {
    //   return (<div className={classnames(styles.wrapper, this.className)}>
    //     {this.renderTabComponent(this.tab)}
    //   </div>);
    // }
    const tabPanes = this.tabs.map((it) => this.renderTab(this.tab.key, it));
    return (
      <div className={classnames(styles.wrapper, this.className)}>
        <Tabs activeKey={this.tab.key} onChange={this.handleChangeTab}>
          {tabPanes}
        </Tabs>
      </div>
    );
  }

  render() {
    return this.renderTabs();
  }
}
