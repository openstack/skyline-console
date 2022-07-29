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
import { inject, observer } from 'mobx-react';
import TabSelectTable from 'components/FormItem/TabSelectTable';
import { NetworkStore } from 'stores/neutron/network';
import { yesNoOptions } from 'utils/constants';
import { networkColumns, networkSortProps } from 'resources/neutron/network';
import { isAdminPage } from 'utils/index';
import { getPath } from 'utils/route-map';

export class NetworkSelectTable extends Component {
  constructor(props) {
    super(props);
    this.stores = {
      project: new NetworkStore(),
      shared: new NetworkStore(),
      external: new NetworkStore(),
      all: new NetworkStore(),
    };
  }

  get location() {
    const { location = {} } = (this.props.rootStore || {}).routing || {};
    return location;
  }

  get isAdminPage() {
    const { pathname } = this.location;
    return isAdminPage(pathname);
  }

  get currentProjectId() {
    return this.props.rootStore.projectId;
  }

  get hasAdminRole() {
    return this.props.rootStore.hasAdminRole;
  }

  get showExternal() {
    const { showExternal = false } = this.props;
    return showExternal;
  }

  get networkTabs() {
    const tabs = [
      { title: t('Current Project Networks'), key: 'project' },
      { title: t('Shared Networks'), key: 'shared' },
    ];
    if (this.showExternal) {
      tabs.push({
        title: t('External Networks'),
        key: 'external',
      });
    }
    if (this.hasAdminRole) {
      tabs.push({
        title: t('All Networks'),
        key: 'all',
      });
    }
    tabs.forEach((tab) => {
      tab.props = this.getSelectTableProps(tab);
    });
    return tabs;
  }

  getSelectTableProps = (tab) => ({
    columns: this.getColumns(tab),
    filterParams: this.getNetworkFilters(tab),
    extraParams: this.getNetworkExtraParams(tab),
    backendPageStore: this.getStore(tab),
    disabledFunc: this.getDisabledFunc(),
    isMulti: this.props.isMulti || false,
    ...networkSortProps,
  });

  getRouteName(routeName) {
    return this.isAdminPage ? `${routeName}Admin` : routeName;
  }

  getRoutePath(routeName, params = {}, query = {}) {
    const realName = this.getRouteName(routeName);
    return getPath({ key: realName, params, query });
  }

  getColumns = (tab) => {
    const columns = networkColumns(this);
    columns[0].render = null;
    const { key } = tab;
    if (key === 'project') {
      return columns.filter((it) => it.dataIndex !== 'project_id');
    }
    if (['shared', 'router:external'].indexOf(key) >= 0) {
      return columns.filter((it) => it.dataIndex !== key);
    }
    return columns;
  };

  onChange = (value) => {
    const { onChange } = this.props;
    onChange && onChange(value);
  };

  get labelStyle() {
    return {
      marginRight: 16,
    };
  }

  getStore(tab) {
    const { key } = tab;
    return this.stores[key];
  }

  getNetworkFilters = (tab) => {
    const { key } = tab;
    const filters = [
      {
        label: t('Name'),
        name: 'name',
      },
    ];
    if (key !== 'shared') {
      filters.push({
        label: t('Shared'),
        name: 'shared',
        options: yesNoOptions,
      });
    }
    if (this.showExternal && key !== 'external') {
      filters.push({
        label: t('External Network'),
        name: 'router:external',
        options: yesNoOptions,
      });
    }
    if (key !== 'project') {
      filters.push({
        label: t('Project Range'),
        name: 'project_id',
        options: [
          { label: t('Current Project'), key: this.currentProjectId },
          { label: t('All'), key: 'all' },
        ],
      });
    }
    return filters;
  };

  getNetworkExtraParams = (tab) => {
    const { key } = tab;
    if (key === 'project') {
      return { project_id: this.currentProjectId };
    }
    if (key === 'shared') {
      return { shared: true };
    }
    if (key === 'external') {
      return { 'router:external': true };
    }
    return {};
  };

  getDisabledFunc() {
    return this.props.disabledFunc;
  }

  render() {
    const { isMulti = false, header, value } = this.props;
    return (
      <TabSelectTable
        tabs={this.networkTabs}
        onChange={this.onChange}
        isMulti={isMulti}
        header={header}
        value={value}
      />
    );
  }
}

export default inject('rootStore')(observer(NetworkSelectTable));
