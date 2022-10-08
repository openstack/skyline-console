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
import { toJS } from 'mobx';
import SelectTable from 'components/FormItem/SelectTable';
import { Radio } from 'antd';
import globalSettingStore from 'stores/skyline/setting';
import globalFlavorStore from 'stores/nova/flavor';
import {
  flavorArchitectures,
  flavorCategoryList,
  getBaseColumns,
  gpuColumns,
  categoryHasIOPS,
  categoryHasEphemeral,
  isBareMetalFlavor,
  isBareMetal,
  getFlavorArchInfo,
  getFlavorSearchFilters,
} from 'resources/nova/flavor';
import styles from './index.less';

export class FlavorSelectTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      arch: null,
      category: null,
    };
    this.init();
  }

  get labelStyle() {
    return {
      marginRight: 16,
    };
  }

  async getSettings() {
    await this.settingStore.fetchList();
    this.initDefaultValue();
  }

  async getFlavors() {
    const { allProjects = false } = this.props;
    await this.flavorStore.fetchList({ all_projects: allProjects });
    this.initDefaultValue();
  }

  get architectures() {
    const custom = {
      architecture: 'custom',
    };
    const all = {
      architecture: 'all',
    };
    const { isIronic = false, filterIronic = true } = this.props;
    const item = (this.settingStore.list.data || []).find(
      (it) => it.key === 'flavor_families'
    );
    if (!item) {
      return [all, custom];
    }
    let values = [];
    try {
      values = (item.value || []).filter((it) => {
        const { architecture } = it;
        if (architecture) {
          if (filterIronic) {
            return isIronic
              ? isBareMetal(architecture)
              : !isBareMetal(architecture);
          }
          return true;
        }
        return false;
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e);
    }
    return [all, ...values, custom];
  }

  get categories() {
    const { arch } = this.state;
    if (!arch) {
      return [];
    }
    const item = this.architectures.find((it) => it.architecture === arch);
    return (item && item.categories) || [];
  }

  get flavors() {
    const {
      flavor,
      isIronic = false,
      filterIronic = true,
      excludeFlavors = [],
    } = this.props;
    const { arch, category } = this.state;
    if (!arch) {
      return [];
    }

    return (this.flavorStore.list.data || [])
      .filter((it) => {
        if (excludeFlavors.length > 0) {
          return excludeFlavors.indexOf(it.id) < 0;
        }
        return true;
      })
      .filter((it) => {
        if (!flavor) {
          return true;
        }
        return it.name !== flavor;
      })
      .filter((it) => {
        if (!filterIronic) {
          return true;
        }
        return isIronic ? isBareMetalFlavor(it) : !isBareMetalFlavor(it);
      })
      .filter((it) => {
        if (arch === 'all') {
          return true;
        }
        if (arch === 'custom') {
          return it.architecture === arch;
        }
        return it.architecture === arch && it.category === category;
      });
  }

  getBaseColumns() {
    const { category, arch } = this.state;
    let base = [...getBaseColumns()];
    base[0].title = t('Name');
    base.splice(1, 1);
    if (!categoryHasIOPS(category)) {
      base = base.filter((it) => it.dataIndex !== 'quota:disk_total_iops_sec');
    }
    if (!categoryHasEphemeral(category)) {
      base = base.filter((it) => it.dataIndex !== 'OS-FLV-EXT-DATA:ephemeral');
    }
    if (arch === 'all') {
      base = [
        ...base,
        {
          title: t('Architecture'),
          dataIndex: 'id',
          render: (value, record) => getFlavorArchInfo(record),
        },
      ];
    }
    return base;
  }

  getGpuColumns() {
    const { category } = this.state;
    if (category === 'compute_optimized_type') {
      return gpuColumns.filter((it) => it.dataIndex.indexOf('gpu') < 0);
    }
    return gpuColumns.filter((it) => it.dataIndex.indexOf('gpu') >= 0);
  }

  get columns() {
    const { arch } = this.state;
    const base = this.getBaseColumns();
    if (isBareMetal(arch)) {
      return [...base.filter((it, index) => index < 3)];
    }
    if (arch !== 'heterogeneous_computing') {
      return base;
    }
    const gpus = this.getGpuColumns();
    return [...base, ...gpus];
  }

  onArchChange = (e) => {
    this.setState({
      arch: e.target.value,
    });
  };

  onCategoryChange = (e) => {
    this.setState({
      category: e.target.value,
    });
  };

  onChange = (value) => {
    const { onChange } = this.props;
    onChange && onChange(value);
  };

  initDefaultValue() {
    const { value: { selectedRowKeys = [] } = {} } = this.props;
    if (selectedRowKeys.length > 0) {
      const flavor = (toJS(this.flavorStore.list.data) || []).find(
        (it) => it.id === selectedRowKeys[0]
      );
      if (flavor) {
        const { architecture, category } = flavor;
        this.setState({
          arch: architecture,
          category,
        });
      }
    } else {
      const arch = this.architectures[0].architecture;
      let category = null;
      if (this.architectures[0].categories) {
        category = this.architectures[0].categories[0].name;
      }
      this.setState({
        arch,
        category,
      });
    }
  }

  init() {
    this.settingStore = globalSettingStore;
    this.flavorStore = globalFlavorStore;
    this.getSettings();
    this.getFlavors();
  }

  renderArchButtons() {
    const { arch } = this.state;
    const items = this.architectures.map((it) => {
      const { architecture } = it;
      const label = flavorArchitectures[architecture] || architecture;
      return (
        <Radio.Button value={architecture} key={architecture}>
          {label}
        </Radio.Button>
      );
    });
    return (
      <Radio.Group
        id="flavor-select-arch"
        onChange={this.onArchChange}
        value={arch}
        buttonStyle="solid"
      >
        {items}
      </Radio.Group>
    );
  }

  renderCategoryButtons() {
    const { category } = this.state;
    const items = this.categories.map((it) => {
      const { name } = it;
      const label = flavorCategoryList[name] || name;
      return (
        <Radio.Button value={name} key={name}>
          {label}
        </Radio.Button>
      );
    });
    return (
      <Radio.Group
        id="flavor-select-category"
        onChange={this.onCategoryChange}
        value={category}
        buttonStyle="solid"
      >
        {items}
      </Radio.Group>
    );
  }

  renderArchSelect() {
    return (
      <div className={styles['flavor-tab']}>
        <span className={styles['flavor-label']}>{t('Architecture')}</span>
        {this.renderArchButtons()}
      </div>
    );
  }

  renderCategorySelect() {
    const { arch } = this.state;
    if (arch === 'custom' || arch === 'all') {
      return null;
    }
    return (
      <div className={styles['flavor-tab']}>
        <span className={styles['flavor-label']}>{t('Category')}</span>
        {this.renderCategoryButtons()}
      </div>
    );
  }

  renderTableHeader() {
    return (
      <div>
        {this.renderArchSelect()}
        {this.renderCategorySelect()}
      </div>
    );
  }

  render() {
    const { value, disabledFunc } = this.props;
    const isLoading =
      this.settingStore.list.isLoading && this.flavorStore.list.isLoading;
    const props = {
      columns: this.columns,
      data: this.flavors,
      tableHeader: this.renderTableHeader(),
      isLoading,
      filterParams: getFlavorSearchFilters(),
      value,
      onChange: this.onChange,
      disabledFunc,
    };
    return <SelectTable {...props} />;
  }
}

export default inject('rootStore')(observer(FlavorSelectTable));
