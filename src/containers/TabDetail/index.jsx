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
import { parse } from 'qs';
import classnames from 'classnames';
import { isEmpty, get } from 'lodash';
import { renderFilterMap, isAdminPage } from 'utils/index';
import { Button, Divider, Tabs, Typography } from 'antd';
import { UpOutlined, DownOutlined, SyncOutlined } from '@ant-design/icons';
import NotFound from 'components/Cards/NotFound';
import Infos from 'components/Infos';
import Notify from 'components/Notify';
import { toJS } from 'mobx';
import checkItemPolicy from 'resources/skyline/policy';
import ItemActionButtons from 'components/Tables/Base/ItemActionButtons';
import { emptyActionConfig } from 'utils/constants';
import { getPath, getLinkRender } from 'utils/route-map';
import { getValueMapRender, getUnitRender } from 'utils/table';
import styles from './index.less';

export default class DetailBase extends React.Component {
  constructor(props, options = {}) {
    super(props);

    this.options = options;

    this.state = {
      notFound: false,
      collapsed: false,
    };

    this.init();
  }

  componentDidMount() {
    this.fetchDataWithPolicy();
  }

  componentDidUpdate(prevProps) {
    const { id: oldId } = prevProps.match.params;
    if (this.id !== oldId) {
      this.handleRefresh(true);
    }
  }

  get params() {
    return this.props.match.params || {};
  }

  get id() {
    return this.props.match.params.id;
  }

  get policy() {
    return '';
  }

  get aliasPolicy() {
    return '';
  }

  get name() {
    return '';
  }

  get routing() {
    return this.props.rootStore.routing;
  }

  get path() {
    const { location: { pathname = '' } = {} } = this.props;
    return pathname || '';
  }

  get isAdminPage() {
    const { pathname } = this.props.location;
    return isAdminPage(pathname);
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
    return [];
  }

  get tab() {
    if (this.tabs.length === 0) {
      return null;
    }
    const params = parse(this.routing.location.search.slice(1));
    const { tab } = params;
    const tabItem = this.tabs.find((it) => it.key === tab);
    return tabItem || this.tabs[0];
  }

  get actionConfigs() {
    return emptyActionConfig;
  }

  get rowActions() {
    return [];
  }

  onCollapsedCallback = () => {};

  handleChangeTab = (tab) => {
    // this.setState({
    //   tab
    // });
    this.handleFetch({ tab }, true);
  };

  handleFetch = (params, refresh) => {
    this.routing.query(params, refresh);
  };

  get detailTabs() {
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

  get titleLabel() {
    return 'ID:';
  }

  get titleValue() {
    return this.params.id;
  }

  get detailTitle() {
    const { collapsed } = this.state;
    const { Paragraph } = Typography;
    const icon = collapsed ? <DownOutlined /> : <UpOutlined />;
    return (
      <div>
        <span className={styles['title-label']}>{this.titleLabel}</span>
        <span className={styles['header-title']}>
          <Paragraph style={{ display: 'inherit' }} copyable>
            {this.titleValue}
          </Paragraph>
        </span>
        <Divider type="vertical" className={styles['header-divider']} />
        <Button onClick={this.goBack} type="link">
          {t('Back')}
        </Button>
        <Button
          type="link"
          icon={<SyncOutlined />}
          onClick={this.handleRefresh}
        />
        <Button
          onClick={this.handleDetailInfo}
          icon={icon}
          type="link"
          className={styles['header-button']}
        />
      </div>
    );
  }

  get className() {
    return '';
  }

  get listUrl() {
    return '';
  }

  get detailData() {
    return toJS(this.store.detail) || {};
  }

  get isLoading() {
    return this.store.isLoading;
  }

  get detailInfos() {
    return [];
  }

  // After the operation, the refreshed Tab needs to be forced to load
  get forceLoadingTabs() {
    return [];
  }

  handleDetailInfo = () => {
    const { collapsed } = this.state;
    this.setState(
      {
        collapsed: !collapsed,
      },
      () => {
        this.onCollapsedCallback(!collapsed);
      }
    );
  };

  getDesc = (data, dataConf) => {
    const { dataIndex, render, valueRender, valueMap, unit } = dataConf;
    const value = get(data, dataIndex);
    if (render) {
      return render(value, data);
    }
    if (valueRender) {
      const renderFunc = renderFilterMap[valueRender];
      return renderFunc && renderFunc(value);
    }
    if (valueMap) {
      return getValueMapRender(dataConf)(value);
    }
    if (unit) {
      return getUnitRender(dataConf)(value);
    }
    if ([undefined, null, ''].includes(value)) {
      return '-';
    }
    return value;
  };

  getActionData() {
    return this.detailData;
  }

  fetchData = (params, silent) => {
    if (this.store.fetchDetail) {
      const newParams = {
        ...this.params,
        ...(params || {}),
        all_projects: this.isAdminPage,
        silent,
      };
      const realParams = this.updateFetchParams(newParams);
      this.store.fetchDetail(realParams).catch(this.catch);
    }
  };

  getRouteProps = () => ({});

  fetchDataWithPolicy = (silent, params) => {
    if (
      !checkItemPolicy({
        policy: this.policy,
        aliasPolicy: this.aliasPolicy,
        actionName: this.name,
      })
    ) {
      const error = {
        message: t("You don't have access to get {name}.", {
          name: this.name.toLowerCase(),
        }),
        status: 403,
      };
      Notify.errorWithDetail(
        error,
        t('Unable to get {name} detail.', { name: this.name.toLowerCase() })
      );
      return;
    }
    this.fetchData(params, silent);
  };

  refreshDetailByTab = (silence = true) => {
    this.fetchDataWithPolicy(silence);
  };

  refreshDetailByAction = (silence) => {
    this.fetchDataWithPolicy(silence);
  };

  handleRefresh = () => {
    this.fetchDataWithPolicy(false);
  };

  catch = (e) => {
    // eslint-disable-next-line no-console
    console.log(e);
    const { data, status } = (e || {}).response || e || {};
    if (status === 401) {
      const title = t('The session has expired, please log in again.');
      Notify.errorWithDetail(null, title);
    } else if (status === 404) {
      this.setState({ notFound: true });
      Notify.warn(
        t('{name} {id} could not be found.', {
          name: this.name.toLowerCase(),
          id: this.id,
        })
      );
    } else {
      const error = {
        message: data,
        status,
      };
      Notify.errorWithDetail(
        error,
        t('Get {name} detail error.', { name: this.name.toLowerCase() })
      );
    }
  };

  goBack = () => {
    this.routing.push(this.listUrl);
  };

  updateFetchParams = (params) => params;

  onFinishAction = (success, fail, isDelete) => {
    if (success && isDelete) {
      this.goBack();
    } else {
      const silence = !this.forceLoadingTabs.includes(this.tab.key);
      this.refreshDetailByAction(silence);
    }
    this.setState({
      inAction: false,
    });
  };

  onClickAction = () => {
    this.setState({
      inAction: true,
    });
  };

  onCancelAction = () => {
    this.setState({
      inAction: false,
    });
  };

  init() {
    this.store = {
      detail: {},
      isLoading: true,
    };
  }

  renderDetailInfos() {
    const { Paragraph } = Typography;
    const { collapsed } = this.state;
    if (isEmpty(this.detailData)) {
      return (
        <Infos
          title={this.detailTitle}
          descriptions={[]}
          loading={this.isLoading}
        />
      );
    }
    const descriptions = collapsed
      ? []
      : this.detailInfos
          .filter((it) => !it.hidden)
          .map((it) => {
            const { title, dataIndex, copyable } = it;
            let desc;
            if (
              this.isLoading ||
              !this.detailData ||
              isEmpty(this.detailData)
            ) {
              desc = '-';
            } else {
              desc = this.getDesc(this.detailData, it);
              if (desc !== '-') {
                if (
                  copyable ||
                  dataIndex.toLowerCase().indexOf('id') === 0 ||
                  dataIndex.toLowerCase().indexOf('_id') >= 0
                ) {
                  desc = (
                    <Paragraph style={{ margin: 0 }} copyable={copyable}>
                      {desc}
                    </Paragraph>
                  );
                }
              }
            }
            return {
              label: title,
              content: desc,
            };
          });
    return (
      <Infos
        title={this.detailTitle}
        descriptions={descriptions}
        loading={this.isLoading}
      />
    );
  }

  renderTabComponent(tabItem) {
    const { component, key, render } = tabItem;
    const { inAction } = this.state;
    if (render) {
      return render;
    }
    return component ? (
      <tabItem.component
        {...this.props}
        detail={this.detailData}
        detailName={`${this.name}-${this.id}`}
        refreshDetail={this.refreshDetailByTab}
        inAction={inAction}
      />
    ) : (
      <span>{key}</span>
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
    if (isEmpty(this.detailData) || this.isLoading) {
      return null;
    }
    if (!this.tab) {
      return null;
    }
    const tabPanes = this.tabs.map((it) => this.renderTab(this.tab.key, it));
    return (
      <div className={classnames(styles['tab-wrapper'], this.className)}>
        <Tabs activeKey={this.tab.key} onChange={this.handleChangeTab}>
          {tabPanes}
        </Tabs>
      </div>
    );
  }

  renderActions() {
    const data = this.getActionData();
    if (isEmpty(data) || this.store.isLoading) {
      return null;
    }
    return (
      <ItemActionButtons
        actions={this.actionConfigs.rowActions || this.actions}
        onFinishAction={this.onFinishAction}
        item={this.getActionData()}
        containerProps={{ isAdminPage: this.isAdminPage }}
        isAdminPage={this.isAdminPage}
        onClickAction={this.onClickAction}
        onCancelAction={this.onCancelAction}
        // firstActionClassName={styles['attach-btn']}
      />
    );
  }

  render() {
    if (this.state.notFound) {
      return <NotFound title={this.name} link={this.listUrl} goList />;
    }

    return (
      <div className={classnames(styles.main, this.className, 'detail-main')}>
        <div className={styles['action-wrapper']}>{this.renderActions()}</div>
        <div className={styles.header}>{this.renderDetailInfos()}</div>
        <div className={styles.tabs}>{this.renderTabs()}</div>
      </div>
    );
  }
}
