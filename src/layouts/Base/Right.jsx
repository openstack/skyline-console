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

import React, { Component, Suspense } from 'react';
import { Layout, Breadcrumb, Skeleton } from 'antd';
import { Link } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import classnames from 'classnames';
import renderRoutes from 'utils/RouterConfig';
import NotFound from 'components/Cards/NotFound';
import PageLoading from 'components/PageLoading';
import { getPath } from 'utils/route-map';
import styles from './index.less';

const { Content } = Layout;

export class Right extends Component {
  constructor(props) {
    super(props);
    this.routes = props.route.routes;
    this.state = {
      hasError: false,
    };
  }

  componentDidUpdate(prevProps) {
    const { location: { pathname: oldPath } = {} } = prevProps;
    const { location: { pathname: newPath } = {} } = this.props;
    if (oldPath !== newPath) {
      this.updateErrorState(false);
    }
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.log(error, errorInfo);
  }

  get isAdminPage() {
    return this.props.isAdminPage || false;
  }

  getRouteName(routeName) {
    return this.isAdminPage ? `${routeName}Admin` : routeName;
  }

  getRoutePath(routeName, params = {}, query = {}) {
    const realName = this.getRouteName(routeName);
    return getPath({ key: realName, params, query });
  }

  checkHasTab = () => {
    const { currentRoutes = [] } = this.props;
    if (currentRoutes.length === 0) {
      return false;
    }
    const { hasTab } = currentRoutes[currentRoutes.length - 1];
    return hasTab || false;
  };

  updateErrorState(flag) {
    this.setState({
      hasError: flag,
    });
  }

  renderBreadcrumb = (currentRoutes = []) => {
    if (!currentRoutes || currentRoutes.length === 0) {
      return null;
    }
    const { hasBreadcrumb = true } = currentRoutes[currentRoutes.length - 1];
    if (!hasBreadcrumb && hasBreadcrumb !== undefined) {
      return null;
    }
    const items = currentRoutes.map((item, index) => {
      if (index === 0 || index === currentRoutes.length - 1) {
        return (
          <Breadcrumb.Item key={item.key} className={styles['breadcrumb-item']}>
            {item.name}
          </Breadcrumb.Item>
        );
      }
      return (
        <Breadcrumb.Item key={item.key}>
          <Link
            key={item.key}
            to={item.path}
            className={classnames(
              styles['breadcrumb-item'],
              styles['breadcrumb-link']
            )}
          >
            {item.name}
          </Link>
        </Breadcrumb.Item>
      );
    });
    if (items.length === 0) {
      return null;
    }
    const { hasTab } = currentRoutes[currentRoutes.length - 1];
    const tabClass = hasTab ? styles['breadcrumb-has-tab'] : '';
    return (
      <div className={`${styles.breadcrumb} ${tabClass}`}>
        <Breadcrumb>{items}</Breadcrumb>
      </div>
    );
  };

  renderChildren = (mainBreadcrumbClass, mainTabClass, extraProps) => {
    const { hasError } = this.state;
    if (hasError) {
      return (
        <NotFound
          title={t('data')}
          link={this.getRoutePath('overview')}
          codeError
        />
      );
    }
    try {
      const children = (
        <div
          className={`${styles.main} ${mainBreadcrumbClass} ${mainTabClass}`}
        >
          {renderRoutes(this.routes, extraProps)}
        </div>
      );
      return children;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e);
      const path = this.getRoutePath('overview');
      return <NotFound title={t('data')} link={path} codeError />;
    }
  };

  render() {
    const { pathname } = this.props.location;
    const { collapsed, currentRoutes, isAdminPage = false } = this.props;

    const breadcrumb = this.renderBreadcrumb(currentRoutes);
    const hasBreadcrumb = breadcrumb !== null;
    const { user } = this.props.rootStore;
    const hasTab = this.checkHasTab(pathname);
    const mainBreadcrumbClass = hasBreadcrumb
      ? ''
      : styles['main-no-breadcrumb'];
    const mainTabClass = hasTab ? styles['main-has-tab'] : '';
    const extraProps = {
      // sliderHover: hover,
      sliderCollapsed: collapsed,
      isAdminPage,
    };
    const children = user ? (
      this.renderChildren(mainBreadcrumbClass, mainTabClass, extraProps)
    ) : (
      <div style={{ margin: '44px' }}>
        <Skeleton />
      </div>
    );
    return (
      <Layout
        className={classnames(
          styles['base-layout-right'],
          collapsed ? styles['base-layout-right-collapsed'] : ''
        )}
      >
        <Content className={styles.content}>
          {breadcrumb}
          <Suspense fallback={<PageLoading className="sl-page-loading" />}>
            {children}
          </Suspense>
        </Content>
      </Layout>
    );
  }
}

export default inject('rootStore')(observer(Right));
