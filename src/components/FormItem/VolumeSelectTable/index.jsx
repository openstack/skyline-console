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
import { VolumeStore } from 'stores/cinder/volume';
import {
  volumeColumns,
  volumeFilters,
  volumeSortProps,
} from 'resources/cinder/volume';

export class VolumeSelectTable extends Component {
  constructor(props) {
    super(props);
    this.stores = {
      available: new VolumeStore(),
      shared: new VolumeStore(),
    };
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
      { title: t('Available'), key: 'available' },
      { title: t('Shared'), key: 'shared' },
    ];
    tabs.forEach((tab) => {
      tab.props = this.getSelectTableProps(tab);
    });
    return tabs;
  }

  getSelectTableProps = (tab) => ({
    columns: this.getColumns(tab),
    filterParams: this.getVolumeFilters(tab),
    extraParams: this.getVolumeExtraParams(tab),
    backendPageStore: this.getStore(tab),
    disabledFunc: this.getDisabledFunc(tab),
    isMulti: this.props.isMulti || false,
    ...volumeSortProps,
  });

  getColumns = (tab) => {
    const columns = volumeColumns;
    const { key } = tab;
    if (key === 'available') {
      return columns.filter(
        (it) => it.dataIndex !== 'status' && it.dataIndex !== 'attachments'
      );
    }
    if (key === 'shared') {
      return columns.filter((it) => it.dataIndex !== 'multiattach');
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

  getVolumeFilters = (tab) => {
    const { key } = tab;
    const filters = [...volumeFilters];
    if (key === 'shared') {
      return filters.filter((it) => it.name !== 'multiattach');
    }
    if (key === 'available') {
      return filters.filter((it) => it.name !== 'status');
    }
    return filters;
  };

  getVolumeExtraParams = (tab) => {
    const { key } = tab;
    if (key === 'shared') {
      return { multiattach: true };
    }
    if (key === 'available') {
      return { status: 'available' };
    }
    return {};
  };

  getDisabledFunc(tab) {
    if (tab.key === 'available') {
      const { disabledFunc = null } = this.props;
      return disabledFunc;
    }
    return this.disallowedMultiAttach;
  }

  disallowedMultiAttach = (volume) => {
    const { attachments = [] } = volume;
    const { serverId } = this.props;
    const attach = attachments.find((it) => it.server_id === serverId);
    return !!attach;
  };

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

export default inject('rootStore')(observer(VolumeSelectTable));
