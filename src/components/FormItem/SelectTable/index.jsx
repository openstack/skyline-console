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
import { Radio, Tag, Button, Tooltip } from 'antd';
import { ClearOutlined, SyncOutlined } from '@ant-design/icons';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import MagicInput from 'components/MagicInput';
import SimpleTable from 'components/Tables/SimpleTable';
import Pagination from 'components/Pagination';
import { get, isString, isEqual, isEmpty } from 'lodash';
import classnames from 'classnames';
import styles from './index.less';

const getItemKey = (item) => item.key || item.id;

const getInitRows = (value, data, backendPageStore) => {
  const { selectedRowKeys = [], selectedRows = [] } = value;
  if (!selectedRowKeys || selectedRowKeys.length === 0) {
    return [];
  }
  const rowKeys = selectedRows.map((it) => getItemKey(it));
  if (isEqual(selectedRowKeys, rowKeys)) {
    return selectedRows;
  }

  const rows = selectedRowKeys.map((key) => {
    const findSourceData = !backendPageStore ? data : selectedRows;
    const item = (findSourceData || []).find((it) => getItemKey(it) === key);
    return (
      item || {
        key,
        id: key,
        name: key,
      }
    );
  });
  return rows;
};

export const renderClearButton = (self, rows, props = {}) => {
  const { showSelected = true } = props;
  if (!showSelected) {
    return null;
  }
  if (!rows || !rows.length) {
    return null;
  }
  return (
    <Tooltip title={t('Clear selected')}>
      <Button size="small" onClick={self.clearSelected}>
        <ClearOutlined />
      </Button>
    </Tooltip>
  );
};

@observer
export default class SelectTable extends React.Component {
  static propTypes = {
    data: PropTypes.array,
    columns: PropTypes.array.isRequired,
    isMulti: PropTypes.bool,
    pageSize: PropTypes.number,
    tabs: PropTypes.array,
    defaultTabValue: PropTypes.any,
    tabsNode: PropTypes.node,
    onTabChange: PropTypes.func,
    canSearch: PropTypes.bool,
    filterParams: PropTypes.array,
    disabledFunc: PropTypes.func,
    onChange: PropTypes.func,
    selectedLabel: PropTypes.string,
    tips: PropTypes.string,
    isLoading: PropTypes.bool,
    tagKey: PropTypes.string,
    secondTagKey: PropTypes.string,
    maxSelectedCount: PropTypes.number,
    tableHeader: PropTypes.any,
    header: PropTypes.any,
    backendPageStore: PropTypes.any,
    backendPageFunc: PropTypes.string,
    backendPageDataKey: PropTypes.string,
    extraParams: PropTypes.object,
    initValue: PropTypes.object,
    rowKey: PropTypes.string,
    isSortByBack: PropTypes.bool,
    defaultSortKey: PropTypes.string,
    defaultSortOrder: PropTypes.string,
    onRow: PropTypes.func,
    childrenColumnName: PropTypes.string,
    imageTabAuto: PropTypes.bool,
    refreshFunc: PropTypes.func,
    hideRefresh: PropTypes.bool,
  };

  static defaultProps = {
    data: [],
    isMulti: false,
    pageSize: 5,
    canSearch: true,
    filterParams: [],
    selectedLabel: '',
    tips: '',
    tableHeader: null,
    header: null,
    backendPageStore: null,
    backendPageFunc: 'fetchListByPage',
    backendPageDataKey: 'list',
    extraParams: {},
    initValue: {},
    rowKey: 'id',
    tagKey: 'name',
    secondTagKey: 'id',
    isSortByBack: false,
    defaultSortKey: '',
    defaultSortOrder: '',
    childrenColumnName: 'children',
    imageTabAuto: false,
    refreshFunc: null,
    hideRefresh: false,
  };

  constructor(props) {
    super(props);
    const { data = [], pageSize, initValue = {} } = props;
    const { selectedRowKeys, selectedRows } = this.getInitValue(props);
    this.state = {
      data,
      filters: null,
      current: 1,
      pageSize,
      total: this.getTotal(props),
      selectedRowKeys,
      selectedRows,
      tab: '',
      initValue,
    };
    this.sortKey = props.defaultSortKey;
    this.sortOrder = props.defaultSortOrder;
  }

  componentDidMount() {
    this.getData();
  }

  componentDidUpdate(prevProps, prevState) {
    if (!isEqual(prevProps.backendPageStore, this.props.backendPageStore)) {
      this.getData();
    }
    const { selectedRowKeys: newKeys } = this.state;
    const { selectedRowKeys: oldKeys } = prevState;
    if (!isEqual(newKeys, oldKeys)) {
      this.onChange({ selectedRowKeys: newKeys });
    }

    if (
      this.props.initValue?.selectedRowKeys &&
      !prevProps.initValue?.selectedRowKeys
    ) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({
        ...this.getInitValue(this.props),
      });
    }
  }

  getData() {
    const { backendPageStore, pageSize } = this.props;
    if (backendPageStore) {
      this.handleFooterPaginationChange(1, pageSize);
    } else {
      this.initTabChange();
    }
  }

  getInitValue(props) {
    const { value = {}, initValue = {}, data = [], backendPageStore } = props;
    if (!isEmpty(initValue)) {
      const { selectedRowKeys = [] } = initValue;
      return {
        selectedRowKeys,
        selectedRows: getInitRows(initValue, data, backendPageStore),
      };
    }
    const { selectedRowKeys = [] } = value || {};
    return {
      selectedRowKeys,
      selectedRows: getInitRows(value || {}, data, backendPageStore),
    };
  }

  getTotal(props) {
    const {
      data = [],
      backendPageStore,
      backendPageDataKey,
    } = props || this.props;
    if (!backendPageStore) {
      return data.length;
    }
    return (backendPageStore[backendPageDataKey] || {}).total;
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { value, data = [], backendPageStore, initValue = {} } = nextProps;
    const newState = {};
    if (!backendPageStore && !isEqual(data, prevState.data)) {
      newState.data = data;
      newState.total = data.length;
      newState.current = prevState.current || 1;
    }

    if (!value) {
      return isEmpty(newState) ? null : newState;
    }
    const { tab } = value;
    if (value && tab !== prevState.tab) {
      newState.tag = tab;
    }
    if (!isEqual(initValue, prevState.initValue)) {
      const { selectedRowKeys = [] } = initValue;
      const selectedRows = getInitRows(initValue, data, backendPageStore);
      newState.selectedRowKeys = selectedRowKeys;
      newState.selectedRows = selectedRows;
      newState.initValue = initValue;
    }
    if (!isEmpty(newState)) {
      return newState;
    }
    return null;
  }

  get tableColumns() {
    const { columns } = this.props;
    return columns.filter((it) => !it.hidden);
  }

  get rowSelection() {
    const { isMulti, disabledFunc, maxSelectedCount, rowKey, tagKey } =
      this.props;
    if (maxSelectedCount === -1) {
      return null;
    }
    const { selectedRowKeys } = this.state;

    const props = {
      selectedRowKeys,
      type: isMulti ? 'checkbox' : 'radio',
      onChange: this.handleSelectRow,
    };
    if (disabledFunc) {
      props.getCheckboxProps = (record) => ({
        disabled: disabledFunc(record),
        name: get(record, rowKey) || get(record, tagKey),
      });
    }
    if (maxSelectedCount && selectedRowKeys.length === maxSelectedCount) {
      props.getCheckboxProps = (record) => ({
        disabled: !selectedRowKeys.includes(get(record, rowKey)),
      });
    }
    return props;
  }

  getDataParams = () => {
    const { filters, current, pageSize } = this.state;
    return {
      page: current,
      limit: pageSize,
      ...filters,
    };
  };

  handleFooterPaginationChange = (current, pageSize) => {
    const { filters } = this.state;
    this.getBackendData({
      limit: pageSize,
      page: current,
      current,
      sortKey: this.sortKey,
      sortOrder: this.sortOrder,
      ...filters,
    });
  };

  getBackendData = async (newParams) => {
    const { extraParams, isSortByBack, defaultSortKey, defaultSortOrder } =
      this.props;
    const params = {
      ...newParams,
      ...extraParams,
    };
    if (isSortByBack) {
      params.sortKey = params.sortKey || this.sortKey || defaultSortKey || '';
      params.sortOrder =
        params.sortOrder || this.sortOrder || defaultSortOrder || '';
    }
    const data = await this.fetchDataByPage(params);
    const { backendPageStore, backendPageDataKey } = this.props;
    const { total } = backendPageStore[backendPageDataKey] || {};
    this.setState(
      {
        data,
        total,
        current: newParams.page,
        pageSize: newParams.limit,
      },
      () => {
        this.initTabChange();
      }
    );
  };

  // eslint-disable-next-line react/sort-comp
  fetchDataByPage = async (params) => {
    const { backendPageStore, backendPageFunc, backendPageDataKey } =
      this.props;
    const data = await backendPageStore[backendPageFunc](params);
    backendPageStore[backendPageDataKey].silent = false;
    return data;
  };

  filterData = (data, filters) => {
    const failed = Object.keys(filters).find((key) => {
      const value = get(data, key);
      const filterValue = filters[key];
      if (isString(value) && isString(filterValue)) {
        return value.toLowerCase().indexOf(filterValue.toLowerCase()) < 0;
      }
      return isEqual(value, filterValue);
    });
    return !failed;
  };

  getDataSource = () => {
    try {
      const { backendPageStore, rowKey } = this.props;
      if (backendPageStore) {
        return this.getDataFromStore();
      }
      const { data } = this.state;
      const tmpData = data.map((it) => {
        if (it.key) {
          return it;
        }
        return {
          ...it,
          key: get(it, rowKey),
        };
      });
      return tmpData;
    } catch (e) {
      return [];
    }
  };

  getDataFromStore = () => {
    const { backendPageStore, backendPageDataKey, rowKey } = this.props;
    const { data = [] } = backendPageStore[backendPageDataKey] || {};
    return data.map((it) => (it.key ? it : { ...it, key: get(it, rowKey) }));
  };

  getRealSelectedKeys = (selectedRowKeys) => {
    const { isMulti, backendPageStore } = this.props;
    if (!backendPageStore || !isMulti) {
      return selectedRowKeys;
    }
    const { selectedRowKeys: keysInState, data } = this.state;
    const currentDataKeys = data.map((it) => getItemKey(it));
    const addKeys = selectedRowKeys.filter(
      (key) => currentDataKeys.indexOf(key) >= 0
    );
    const delKeys = keysInState.filter(
      (key) =>
        currentDataKeys.indexOf(key) >= 0 && selectedRowKeys.indexOf(key) < 0
    );
    return Array.from(new Set([...keysInState, ...addKeys])).filter(
      (key) => delKeys.indexOf(key) < 0
    );
  };

  handleSelectRow = (selectedRowKeys) => {
    const newKeys = this.getRealSelectedKeys(selectedRowKeys);
    const selectedRows = this.getSelectedRows(newKeys);
    this.setState({
      selectedRowKeys: newKeys,
      selectedRows,
    });
  };

  handleFilterInput = (tags) => {
    this.setState({ tags });
    const { backendPageStore } = this.props;
    const filters = {};
    tags.forEach((n) => {
      filters[n.filter.name] = n.value;
    });
    if (backendPageStore) {
      const { pageSize } = this.state;
      this.getBackendData({
        limit: pageSize,
        page: 1,
        ...filters,
      });
      this.setState({
        filters,
        current: 1,
      });
    } else {
      this.setState({
        filters,
        current: 1,
      });
    }
  };

  updateTab = (tab) => {
    this.setState(
      {
        tab,
      },
      () => {
        this.onChange({ tab });
      }
    );
  };

  getLoading() {
    const { backendPageStore, backendPageDataKey, isLoading } = this.props;
    if (backendPageStore) {
      return backendPageStore[backendPageDataKey].isLoading;
    }
    return isLoading;
  }

  onChange = ({ tab, selectedRowKeys } = {}) => {
    const { onChange } = this.props;
    if (onChange) {
      const {
        tab: tabInState,
        selectedRowKeys: keysInState,
        selectedRows = [],
      } = this.state;
      const rows = isEmpty(selectedRows)
        ? this.getSelectedRows(selectedRowKeys)
        : selectedRows;
      onChange({
        tab: tab || tabInState,
        selectedRows: rows,
        selectedRowKeys: selectedRowKeys || keysInState,
        data: this.getDataSource(),
      });
    }
  };

  getSelectedRowsAll = (selectedRowKeys) => {
    const { data = [], selectedRowKeys: keysInState } = this.state;
    if (selectedRowKeys) {
      return data.filter((it) => selectedRowKeys.indexOf(getItemKey(it)) >= 0);
    }
    return data.filter((it) => keysInState.indexOf(getItemKey(it)) >= 0);
  };

  getSelectedRowsBackend = (selectedRowKeys) => {
    const { isMulti } = this.props;
    const {
      data = [],
      selectedRowKeys: keysInState,
      selectedRows: rowsInState,
    } = this.state;
    if (isMulti) {
      return this.getSelectedRowsBackendMulti(selectedRowKeys);
    }
    const keys = selectedRowKeys || keysInState;
    const rows = data.filter((it) => keys.indexOf(getItemKey(it)) >= 0);
    if (rows.length === keys.length) {
      return rows;
    }
    const oldRows = rowsInState.filter(
      (it) => keys.indexOf(getItemKey(it)) >= 0
    );
    if (oldRows.length === keys.length) {
      return oldRows;
    }
    return keys.map((it) => ({
      key: it,
      id: it,
      name: it,
    }));
  };

  getSelectedRowsBackendMulti = (selectedRowKeys) => {
    const {
      data = [],
      selectedRowKeys: keysInState = [],
      selectedRows: rowsInState = [],
    } = this.state;
    if (!selectedRowKeys) {
      return rowsInState;
    }
    const addKeys = selectedRowKeys.filter((it) => keysInState.indexOf(it) < 0);
    const delKeys = keysInState.filter((it) => selectedRowKeys.indexOf(it) < 0);
    const oldLeftRows = rowsInState.filter(
      (it) => delKeys.indexOf(getItemKey(it)) < 0
    );
    const newRows = data.filter((it) => addKeys.indexOf(getItemKey(it)) >= 0);
    return [...oldLeftRows, ...newRows];
  };

  getSelectedRows = (selectedRowKeys) => {
    const { backendPageStore } = this.props;
    if (backendPageStore) {
      return this.getSelectedRowsBackend(selectedRowKeys);
    }
    return this.getSelectedRowsAll(selectedRowKeys);
  };

  getSortKey = (sorter) => {
    const { field, column } = sorter;
    if (!field) {
      return null;
    }
    if (!column) {
      return null;
    }
    return column.sortKey || column.dataIndex;
  };

  handleChange = (pagination, filters, sorter, extra) => {
    // eslint-disable-next-line no-console
    console.log(pagination, filters, sorter, extra);
    let { current, pageSize } = pagination;
    const { backendPageStore, isSortByBack } = this.props;
    const params = {
      limit: pageSize || this.state.pageSize,
      page: current || this.state,
      current,
      sortKey: this.getSortKey(sorter),
      sortOrder: sorter.order,
      ...filters,
    };
    if (backendPageStore) {
      const { action } = extra;
      if (action === 'sort') {
        this.sortKey = this.getSortKey(sorter);
        this.sortOrder = sorter.order;
        if (!isSortByBack) {
          current = this.state.current;
          pageSize = this.state.pageSize;
          this.setState({
            current,
            pageSize,
          });
        } else {
          this.setState({
            current: 1,
          });
          params.current = 1;
          params.page = 1;
          this.getBackendData(params);
        }
      } else {
        this.getBackendData(params);
        // this.getBackendData({
        //   limit: pageSize,
        //   page: current,
        //   current,
        //   ...filters,
        // });
      }
    } else {
      this.setState({
        current,
        pageSize,
      });
    }
  };

  onTabChange = (e) => {
    const { onTabChange } = this.props;
    if (onTabChange) {
      if (e.target) {
        this.updateTab(e.target.value);
        onTabChange(e.target.value);
      } else {
        onTabChange(e);
        this.updateTab(e);
      }
    }
    // const { selectedRowKeys } = this.state;
    // this.handleSelectRow(selectedRowKeys);
  };

  onTagClose = (item) => {
    const { selectedRowKeys } = this.state;
    const newKeys = selectedRowKeys.filter((it) => it !== getItemKey(item));
    const selectedRows = this.getSelectedRows(newKeys);
    this.setState({
      selectedRowKeys: newKeys,
      selectedRows,
    });
  };

  clearSelected = () => {
    this.setState({
      selectedRowKeys: [],
      selectedRows: [],
    });
  };

  handleRefresh = () => {
    console.log('handleRefresh');
    const { backendPageStore, refreshFunc } = this.props;
    const { tags = [] } = this.state;
    if (refreshFunc) {
      refreshFunc();
      return;
    }
    if (backendPageStore) {
      this.handleFilterInput(tags);
    }
  };

  initTabChange() {
    const { defaultTabValue, onTabChange, value } = this.props;
    if (defaultTabValue !== undefined && onTabChange !== undefined) {
      const tab = (value && value.tab) || defaultTabValue;
      onTabChange(tab);
      this.updateTab(tab);
    }
  }

  renderRefresh() {
    const { hideRefresh, backendPageStore, refreshFunc } = this.props;
    let showButton = false;
    if (!hideRefresh) {
      if (backendPageStore) {
        showButton = true;
      } else if (refreshFunc) {
        showButton = true;
      }
    }
    if (!showButton) {
      return null;
    }
    return (
      <Button
        type="default"
        icon={<SyncOutlined />}
        onClick={this.handleRefresh}
      />
    );
  }

  renderSearch() {
    const { canSearch } = this.props;
    if (!canSearch) {
      return null;
    }
    const { filterParams } = this.props;
    const { filters } = this.state;
    return (
      <div
        className={classnames(
          'ant-col-xs-16',
          'ant-col-sm-12',
          styles['search-wrapper']
        )}
      >
        <MagicInput
          filterParams={filterParams}
          onInputChange={this.handleFilterInput}
          initValue={filters}
        />
      </div>
    );
  }

  renderSearchLine() {
    return (
      <div className={styles['search-line']}>
        {this.renderSearch()}
        {this.renderRefresh()}
      </div>
    );
  }

  renderHeader() {
    const { header } = this.props;
    return header || null;
  }

  renderTableHeader() {
    const { tableHeader } = this.props;
    return tableHeader || null;
  }

  renderTableFooter = (currentPageData) => {
    const { page, current, pageSize, total } = this.state;
    const isLoading = this.getLoading();
    const defaultPageSizeOptions = [10, 20, 50, 100];
    const pageSizeOptions = Array.from(
      new Set([this.props.pageSize, ...defaultPageSizeOptions])
    ).sort((a, b) => a - b);
    return (
      <Pagination
        current={page || current || 1}
        pageSize={pageSize}
        size="small"
        onChange={this.handleFooterPaginationChange}
        currentDataSize={currentPageData.length}
        total={total}
        isLoading={isLoading}
        defaultPageSize={this.props.pageSize}
        pageSizeOptions={pageSizeOptions}
        className={styles['pagination-footer']}
      />
    );
  };

  renderTable() {
    const {
      backendPageStore,
      isSortByBack,
      defaultSortKey,
      defaultSortOrder,
      filterParams,
      onRow,
      rowKey,
      childrenColumnName,
    } = this.props;
    const { current, pageSize, total, filters } = this.state;
    const defaultPageSizeOptions = [10, 20, 50, 100];
    const pageSizeOptions = [this.props.pageSize, ...defaultPageSizeOptions]
      .sort((a, b) => a - b)
      .map((v) => `${v}`);
    const pagination = backendPageStore
      ? false
      : {
          current,
          pageSize,
          total,
          size: 'small',
          position: ['bottomLeft'],
          pageSizeOptions,
        };
    const footer = backendPageStore ? this.renderTableFooter : null;
    const isLoading = this.getLoading();
    const data = this.getDataSource();
    const pageTableClass = backendPageStore
      ? styles['sl-select-table-backend']
      : '';
    // const total = this.getTotal();
    return (
      <SimpleTable
        className={classnames(
          styles['sl-select-table'],
          'sl-select-table',
          pageTableClass
        )}
        rowSelection={this.rowSelection}
        rowKey={rowKey}
        columns={this.tableColumns}
        data={data}
        filters={filters}
        searchFilters={filterParams}
        pagination={pagination}
        isLoading={isLoading}
        filterByBackend={!!backendPageStore}
        isSortByBack={isSortByBack}
        defaultSortKey={defaultSortKey}
        defaultSortOrder={defaultSortOrder}
        onChange={this.handleChange}
        footer={footer}
        onRow={onRow}
        childrenColumnName={childrenColumnName}
      />
    );
  }

  renderImageTabs() {
    const { tabs, defaultTabValue, imageTabAuto } = this.props;
    const { tab } = this.state;
    const items = tabs.map((it) => {
      const { value, image, component, label } = it;
      return (
        <Radio.Button
          className={imageTabAuto ? '' : styles['image-tab']}
          value={value}
          key={value}
        >
          {image && <img src={image} alt={label} />}
          {component}
          <span className={styles['image-tab-label']}>{label}</span>
        </Radio.Button>
      );
    });
    return (
      <Radio.Group
        className={styles['image-tabs']}
        id="select-table-tabs"
        onChange={this.onTabChange}
        defaultValue={defaultTabValue}
        value={tab}
      >
        {items}
      </Radio.Group>
    );
  }

  renderNormalTabs() {
    const { tabs, defaultTabValue } = this.props;
    const { tab } = this.state;
    const items = tabs.map((it) => (
      <Radio.Button
        className={styles['normal-tab']}
        value={it.value}
        key={it.value}
      >
        <span className={styles['normal-tab-label']}>{it.label}</span>
      </Radio.Button>
    ));
    return (
      <Radio.Group
        className={styles['normal-tabs']}
        onChange={this.onTabChange}
        buttonStyle="solid"
        defaultValue={defaultTabValue}
        value={tab}
      >
        {items}
      </Radio.Group>
    );
  }

  renderTips() {
    const { tips } = this.props;
    if (tips) {
      return <div>{tips}</div>;
    }
    return null;
  }

  renderTabs() {
    const { tabs, tabsNode } = this.props;
    if (tabsNode) {
      return tabsNode;
    }
    if (tabs) {
      const hasImage = tabs.find((it) => !!it.image || !!it.component);
      if (hasImage) {
        return this.renderImageTabs();
      }
      return this.renderNormalTabs();
    }
    return null;
  }

  renderTag = (item) => (
    <Tag
      key={item.key || get(item, this.props.rowKey)}
      closable
      onClose={() => this.onTagClose(item)}
    >
      {item[this.props.tagKey] || item[this.props.secondTagKey]}
    </Tag>
  );

  renderClearButton = (rows) => {
    return renderClearButton(this, rows, this.props);
  };

  renderSelected() {
    const { showSelected = true, selectedLabel, maxSelectedCount } = this.props;
    if (maxSelectedCount === -1) {
      return null;
    }
    const { selectedRows = [] } = this.state;
    if (!showSelected) {
      return null;
    }
    const rows = isEmpty(selectedRows) ? this.getSelectedRows() : selectedRows;
    const items = rows.map((it) => this.renderTag(it));
    const clearButton = this.renderClearButton(rows);
    return (
      <div>
        {t('Selected')} {selectedLabel}:&nbsp;&nbsp;{clearButton}&nbsp;&nbsp;
        {items}
      </div>
    );
  }

  render() {
    return (
      <div className={styles['select-table']}>
        {this.renderHeader()}
        {this.renderTabs()}

        {this.renderSearchLine()}
        {this.renderTableHeader()}
        {this.renderTable()}
        {this.renderSelected()}
      </div>
    );
  }
}
