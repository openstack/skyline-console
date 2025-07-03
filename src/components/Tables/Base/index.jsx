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
import PropTypes from 'prop-types';
import classnames from 'classnames';
import isEqual from 'react-fast-compare';
import { toJS } from 'mobx';
import { inject } from 'mobx-react';
import { includes, get, isArray, isString } from 'lodash';
import { Button, Table, Dropdown, Input, Typography, Tooltip } from 'antd';
import ViewSvgIcon from 'asset/cube/monochrome/view.svg';
import PauseSvgIcon from 'asset/cube/monochrome/pause.svg';
import RefreshSvgIcon from 'asset/cube/monochrome/arrow_refresh_02.svg';
import PlaySvgIcon from 'asset/cube/monochrome/play.svg';
import FileSvgIcon from 'asset/cube/monochrome/file.svg';
import QuestionMarkSvgIcon from 'asset/cube/monochrome/question_mark.svg';
import CubeIconButton from 'components/cube/CubeButton/CubeIconButton';
import CubePagination from 'components/cube/CubePagination';
import MagicInput from 'components/MagicInput';
import TimeFilter from 'components/TimeFilter';
import {
  getColumnSorter,
  getSortOrder,
  updateColumnSort,
  checkIsStatusColumn,
  getStatusRender,
  getRender,
  getValueRenderFunc,
  getNameRenderByRouter,
  getNameRender,
  columnRender,
  getValueMapRender,
  getUnitRender,
  getProjectRender,
  getProjectId,
} from 'utils/table';
import { getNoValue } from 'utils/index';
import { getLocalStorageItem, setLocalStorageItem } from 'utils/local-storage';
import CustomColumns from './CustomColumns';
import ItemActionButtons from './ItemActionButtons';
import PrimaryActionButtons from './PrimaryActionButtons';
import BatchActionButtons from './BatchActionButtons';
import Download from './Download';
import styles from './index.less';

export class BaseTable extends React.Component {
  static propTypes = {
    data: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired,
    columns: PropTypes.array.isRequired,
    selectedRowKeys: PropTypes.array,
    isLoading: PropTypes.bool,
    pagination: PropTypes.object,
    filters: PropTypes.object,
    keyword: PropTypes.string,
    rowKey: PropTypes.any,
    onFetch: PropTypes.func,
    onFilterChange: PropTypes.func,
    onSelectRowKeys: PropTypes.func,
    getCheckboxProps: PropTypes.func,
    hideHeader: PropTypes.bool,
    hideSearch: PropTypes.bool,
    hideCustom: PropTypes.bool,
    batchActions: PropTypes.array,
    alwaysUpdate: PropTypes.bool,
    emptyText: PropTypes.oneOfType([PropTypes.string || PropTypes.func]),
    resourceName: PropTypes.string,
    detailName: PropTypes.string,
    expandable: PropTypes.object,
    showTimeFilter: PropTypes.bool,
    timeFilter: PropTypes.any,
    isPageByBack: PropTypes.bool,
    isSortByBack: PropTypes.bool,
    ableSkipPageByBackend: PropTypes.bool,
    autoRefresh: PropTypes.bool,
    hideRefresh: PropTypes.bool,
    hideAutoRefresh: PropTypes.bool,
    startRefreshAuto: PropTypes.func,
    stopRefreshAuto: PropTypes.func,
    dataDurationAuto: PropTypes.number,
    defaultSortKey: PropTypes.string,
    defaultSortOrder: PropTypes.string,
    hideTotal: PropTypes.bool,
    hideDownload: PropTypes.bool,
    primaryActionsExtra: PropTypes.any,
    isAdminPage: PropTypes.bool,
    containerProps: PropTypes.any,
    middleComponentInHeader: PropTypes.node,
  };

  static defaultProps = {
    rowKey: 'name',
    selectedRowKeys: [],
    onFetch() {},
    hideHeader: false,
    hideSearch: false,
    hideCustom: false,
    resourceName: '',
    detailName: '',
    expandable: undefined,
    showTimeFilter: false,
    isPageByBack: false,
    isSortByBack: false,
    autoRefresh: true,
    hideRefresh: false,
    hideAutoRefresh: false,
    dataDurationAuto: 15,
    defaultSortKey: '',
    defaultSortOrder: '',
    hideTotal: false,
    hideDownload: false,
    primaryActionsExtra: null,
    isAdminPage: false,
    ableSkipPageByBackend: false,
  };

  constructor(props) {
    super(props);
    this.state = {
      hideRow:
        getLocalStorageItem(`${this.useId}-${props.resourceName}`) ||
        props.columns
          .filter((col) => col.isDefaultHidden)
          .map((col) => this.getDataIndex(col.dataIndex) || col.key),
      // eslint-disable-next-line react/no-unused-state
      filters: [],
      timeFilter: {},
      autoRefresh: props.autoRefresh,
    };

    this.sortKey = props.defaultSortKey;
    this.sortOrder = props.defaultSortOrder;
    this.suggestions = props.columns
      .filter((column) => column.search && column.dataIndex)
      .map((column) => ({
        label: column.title,
        key: column.dataIndex,
        options:
          column.filters &&
          column.filters.map((filter) => ({
            label: filter.text,
            key: filter.value,
          })),
      }));
  }

  get hideableRows() {
    return this.props.columns
      .filter((column) => !column.hidden)
      .filter((column) => column.isHideable)
      .map((column) => ({
        label: column.title,
        value: this.getDataIndex(column.dataIndex) || column.key,
      }));
  }

  get useId() {
    const { user = {} } = toJS(this.props.rootStore) || {};
    const { user: { id } = {} } = user || {};
    return id;
  }

  get itemActions() {
    const { itemActions = {} } = this.props;
    return itemActions;
  }

  getDataIndex = (dataIndex) => {
    if (isArray(dataIndex)) {
      return dataIndex.join(',');
    }
    return dataIndex;
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

  // eslint-disable-next-line no-unused-vars
  handleChange = (pagination, filters, sorter, extra) => {
    const { action } = extra;
    let params = {
      limit: pagination.pageSize,
      page: pagination.current,
      current: pagination.current,
      sortKey: this.getSortKey(sorter),
      sortOrder: sorter.order,
      ...filters,
    };
    const { ableSkipPageByBackend, isPageByBack } = this.props;
    if (action === 'sort') {
      if (isPageByBack && !ableSkipPageByBackend) {
        const { pagination: propsPagination } = this.props;
        params = {
          ...params,
          limit: propsPagination.pageSize,
          page: propsPagination.current,
          current: propsPagination.current,
        };
      }
      this.sortKey = this.getSortKey(sorter);
      this.sortOrder = sorter.order;
      this.props.onFetchBySort(params);
    } else {
      this.props.onFetch(params);
    }
  };

  // TODO
  handlePageChange = (current, pageSize) => {
    const { filters } = this.state;
    const { onFetch, defaultSortKey, defaultSortOrder } = this.props;
    onFetch &&
      onFetch({
        limit: pageSize,
        page: current,
        current,
        sortKey: this.sortKey || defaultSortKey,
        sortOrder: this.sortOrder || defaultSortOrder,
        ...filters,
      });
  };

  handleRefresh = () => {
    this.props.onRefresh(true);
  };

  handleRowHide = (columns) => {
    const hideableColValues = this.hideableRows.map((item) => item.value);
    this.setState(
      {
        hideRow: hideableColValues.filter((value) => !columns.includes(value)),
      },
      () => {
        setLocalStorageItem(
          `${this.useId}-${this.props.resourceName}`,
          this.state.hideRow
        );
      }
    );
  };

  handleCancelSelect = () => {
    this.props.onSelectRowKeys([]);
  };

  handleFilterChange = (filters, timeFilter) => {
    if (
      !isEqual(filters, this.props.filters) ||
      !isEqual(timeFilter, this.props.timeFilter)
    ) {
      this.setState({
        // eslint-disable-next-line react/no-unused-state
        filters,
        timeFilter,
      });
      const { pageSize } = this.props.pagination;
      const { sortKey, sortOrder, onFilterChange } = this.props;
      onFilterChange &&
        onFilterChange(
          {
            limit: pageSize,
            page: 1,
            sortKey,
            sortOrder,
            ...filters,
          },
          timeFilter
        );
    }
  };

  handleTimeChange = (values) => {
    this.handleFilterChange(this.state.filters, values);
  };

  handleFilterInput = (tags) => {
    const filters = {};
    tags.forEach((n) => {
      filters[n.filter.name] = n.value;
    });
    this.handleFilterChange(filters, this.state.timeFilter);
  };

  handleInputFocus = (value) => {
    const { handleInputFocus } = this.props;
    handleInputFocus && handleInputFocus(value);
  };

  handleFilterInputText = (e) => {
    const filters = {};
    const { value } = e.currentTarget;
    if (value) {
      filters.keywords = value;
    }
    this.handleFilterChange(filters, this.state.timeFilter);
  };

  hasItemActions = () => {
    const { firstAction, moreActions, actionList } = this.itemActions;
    if (firstAction) {
      return true;
    }
    if (moreActions && moreActions.length) {
      return true;
    }
    return actionList && actionList.length > 0;
  };

  getNoValueRender = (render) => {
    if (render) {
      return render;
    }
    return (value) => getNoValue(value);
  };

  // eslint-disable-next-line no-unused-vars
  getPriceRender = (render, column) => {
    if (render) {
      return render;
    }
    return (value) => {
      const valueStr = isString(value) ? value : (value || 0).toFixed(2);
      return <span style={{ color: globalCSS.moneyColor }}>{valueStr}</span>;
    };
  };

  getTipRender = (tip, render, dataIndex, Icon = FileSvgIcon) => {
    const newRender = (value, record) => {
      const tipValue = tip(value, record);
      const realValue = render ? render(value, record) : get(record, dataIndex);
      if (!tipValue) {
        return realValue;
      }
      return (
        <div style={{ display: 'flex' }}>
          {realValue}
          <Tooltip title={tipValue}>
            <Icon width={16} height={16} style={{ marginLeft: 8 }} />
          </Tooltip>
        </div>
      );
    };
    return newRender;
  };

  getColumnTitle = (column) => {
    const { title, titleTip } = column;
    if (!titleTip) {
      return title;
    }
    return (
      <span className={styles['column-title-wrap']}>
        {title}
        <Tooltip title={titleTip}>
          <QuestionMarkSvgIcon width={16} height={16} />
        </Tooltip>
      </span>
    );
  };

  getBaseColumns = (columns) =>
    columns.map((column) => {
      const { Paragraph } = Typography;
      const {
        sortable,
        dataIndex,
        valueRender,
        sorter,
        sortOrder,
        render,
        copyable,
        tip,
        isStatus,
        isName,
        isLink,
        routeName,
        linkPrefix,
        isPrice,
        valueMap,
        unit,
        ...rest
      } = column;
      const newSorter = getColumnSorter(column, this.props);
      const newSortOrder =
        sortOrder || newSorter ? getSortOrder(dataIndex, this.props) : null;
      let newRender = render || getRender(valueRender);
      if (valueMap) {
        newRender = getValueMapRender(column);
      }
      if (unit) {
        newRender = getUnitRender(column);
      }
      if (checkIsStatusColumn(dataIndex, isStatus)) {
        newRender = getStatusRender(newRender);
      }
      if (dataIndex === 'description') {
        newRender = this.getNoValueRender(newRender);
      }
      if (dataIndex === 'project_name') {
        newRender = getProjectRender(newRender);
      }
      if ((dataIndex === 'name' && routeName) || isLink) {
        const { rowKey } = this.props;
        newRender = getNameRenderByRouter(newRender, column, rowKey);
      }
      if ((dataIndex === 'name' && linkPrefix) || isName) {
        const { rowKey } = this.props;
        newRender = getNameRender(newRender, column, rowKey);
      }
      if (dataIndex === 'cost' || isPrice) {
        newRender = this.getPriceRender(newRender, column);
      }
      if (copyable) {
        newRender = (value) => {
          if (value && value !== '-') {
            return <Paragraph copyable>{value}</Paragraph>;
          }
          return '-';
        };
      }
      if (tip) {
        const { tipIcon } = column;
        newRender = this.getTipRender(tip, newRender, dataIndex, tipIcon);
      }
      const newColumn = {
        ...rest,
        title: this.getColumnTitle(column),
        dataIndex,
        align: column.align || 'left',
      };
      if (newSorter) {
        newColumn.sorter = newSorter;
      }
      if (sortOrder) {
        newColumn.sortOrder = newSortOrder;
      }
      updateColumnSort(newColumn, this.props);
      if (newRender) {
        newColumn.render = newRender;
      }
      return {
        ...newColumn,
        render: (value, record) =>
          columnRender(newColumn.render, value, record),
      };
    });

  getColumns = () => {
    const {
      columns,
      containerProps,
      onClickAction,
      onFinishAction,
      onCancelAction,
      isAdminPage,
    } = this.props;
    const { hideRow } = this.state;
    const currentColumns = columns
      .filter((it) => !it.hidden)
      .filter((it) => !includes(hideRow, this.getDataIndex(it.dataIndex)));
    const baseColumns = this.getBaseColumns(currentColumns);
    if (!this.hasItemActions()) {
      return baseColumns;
    }
    return [
      ...baseColumns,
      {
        title: t('Action'),
        key: 'operation',
        width: 150,
        render: (text, record, index) => (
          <ItemActionButtons
            isAdminPage={isAdminPage}
            actions={this.itemActions}
            onFinishAction={onFinishAction}
            onCancelAction={onCancelAction}
            item={record}
            index={index}
            containerProps={containerProps}
            onClickAction={onClickAction}
          />
        ),
      },
    ];
  };

  stopRefreshAuto = () => {
    this.setState({
      autoRefresh: false,
    });
    const { stopRefreshAuto } = this.props;
    if (stopRefreshAuto) {
      stopRefreshAuto();
    }
  };

  startRefreshAuto = () => {
    this.setState({
      autoRefresh: true,
    });
    const { startRefreshAuto } = this.props;
    if (startRefreshAuto) {
      startRefreshAuto();
    }
  };

  filterDownloadColumns(columns) {
    const { rowKey } = this.props;
    const downloadColumns = columns
      .filter((it) => !it.hidden)
      .map((it) => {
        const { title, splitColumnForDownload = true } = it;
        if (title.includes('/') && splitColumnForDownload) {
          const [fTitle, sTitle] = it.title.split('/');
          let sName = sTitle;
          if (fTitle.length > 2) {
            sName = `${fTitle.split('ID')[0]}${sTitle}`;
          }
          let fIndex = it.idKey || rowKey;
          let render = null;
          if (
            it.title.includes(t('Project')) &&
            it.dataIndex === 'project_name'
          ) {
            fIndex = 'project_id';
            render = (_, record) => getProjectId(record);
          }
          return [
            {
              title: fTitle,
              dataIndex: fIndex,
              render,
            },
            {
              ...it,
              title: sName,
            },
          ];
        }
        return it;
      });
    return [].concat(...downloadColumns);
  }

  renderBatchActions() {
    const {
      batchActions,
      selectedRowKeys,
      data,
      rowKey,
      containerProps,
      onClickAction,
      onFinishAction,
      onCancelAction,
      resourceName,
      isAdminPage,
    } = this.props;
    const selectedItems = data.filter(
      (it) => selectedRowKeys.indexOf(it[rowKey]) >= 0
    );
    if (batchActions) {
      return (
        <BatchActionButtons
          isAdminPage={isAdminPage}
          visibleButtonNumber={3}
          selectedItemKeys={selectedRowKeys}
          selectedItems={selectedItems}
          batchActions={batchActions}
          onFinishAction={onFinishAction}
          onCancelAction={onCancelAction}
          containerProps={containerProps}
          onClickAction={onClickAction}
          resourceName={resourceName}
        />
      );
    }
    return null;
  }

  renderSelectedTitle = () => (
    <div className={styles['select-title']}>
      <div>{this.renderBatchActions()}</div>
      <div>
        <Button
          type="flat"
          className={styles['cancel-select']}
          onClick={this.handleCancelSelect}
        >
          {t('Cancel Select')}
        </Button>
      </div>
    </div>
  );

  renderTimeFilter() {
    const { showTimeFilter, filterTimeDefaultValue } = this.props;
    if (!showTimeFilter) {
      return null;
    }
    const props = {
      onChange: this.handleTimeChange,
      className: styles.timer,
    };
    if (filterTimeDefaultValue !== undefined) {
      props.defaultValue = filterTimeDefaultValue;
    }
    return <TimeFilter {...props} />;
  }

  renderSearch() {
    const { hideSearch, searchFilters, initFilter = {} } = this.props;

    if (hideSearch) {
      return null;
    }

    if (searchFilters.length > 0) {
      return (
        <div className={styles['search-row']}>
          <MagicInput
            filterParams={searchFilters}
            initValue={initFilter}
            onInputChange={this.handleFilterInput}
            onInputFocus={this.handleInputFocus}
            placeholder={t('Multiple filter tags are separated by enter')}
          />
        </div>
      );
    }
    return (
      <div className={styles['search-row']}>
        <Input
          placeholder={t('Enter query conditions to filter')}
          onChange={this.handleFilterInputText}
        />
      </div>
    );
  }

  renderMiddleInHeader() {
    const { middleComponentInHeader } = this.props;
    if (middleComponentInHeader) {
      return middleComponentInHeader;
    }
    return null;
  }

  renderActions() {
    const {
      isAdminPage,
      primaryActions,
      containerProps,
      onClickAction,
      onFinishAction,
      onCancelAction,
      primaryActionsExtra,
    } = this.props;
    if (primaryActions) {
      return (
        <PrimaryActionButtons
          isAdminPage={isAdminPage}
          primaryActions={primaryActions}
          containerProps={containerProps}
          onClickAction={onClickAction}
          onFinishAction={onFinishAction}
          onCancelAction={onCancelAction}
          primaryActionsExtra={primaryActionsExtra}
        />
      );
    }
    return null;
  }

  renderCustomButton() {
    const { hideCustom } = this.props;
    if (hideCustom) {
      return null;
    }
    return (
      <Dropdown overlay={this.renderRowMenu()}>
        <CubeIconButton type="default" icon={ViewSvgIcon} />
      </Dropdown>
    );
  }

  renderDownload() {
    const {
      pagination,
      data,
      columns,
      resourceName,
      detailName,
      getDownloadData,
      onClickAction,
      onCancelAction,
      hideDownload,
    } = this.props;
    if (hideDownload) {
      return null;
    }
    const { total } = pagination;
    const downloadColumns = this.filterDownloadColumns(columns);
    const props = {
      data,
      columns: downloadColumns,
      total,
      getValueRenderFunc,
      resourceName,
      extraName: detailName,
      getData: getDownloadData,
      onBeginDownload: onClickAction,
      onFinishDownload: onCancelAction,
      onCancelDownload: onCancelAction,
    };
    return <Download {...props} />;
  }

  renderRefresh() {
    const { hideRefresh } = this.props;
    if (hideRefresh) {
      return null;
    }
    return (
      <CubeIconButton
        type="default"
        icon={RefreshSvgIcon}
        onClick={this.handleRefresh}
      />
    );
  }

  renderRefreshAuto() {
    // const { hideAutoRefresh, dataDurationAuto } = this.props;
    const { hideAutoRefresh } = this.props;
    if (hideAutoRefresh) {
      return null;
    }
    const { autoRefresh } = this.state;
    if (autoRefresh) {
      // const tip = t('Stop refreshing data every {num} seconds', { num: dataDurationAuto });
      const tip = t('Stop auto refreshing data');
      return (
        <Tooltip title={tip}>
          <CubeIconButton
            type="default"
            icon={PauseSvgIcon}
            onClick={this.stopRefreshAuto}
          />
        </Tooltip>
      );
    }
    // const tip = t('Start refreshing data every {num} seconds', { num: dataDurationAuto });
    const tip = t('Start auto refreshing data');
    return (
      <Tooltip title={tip}>
        <CubeIconButton
          type="default"
          icon={PlaySvgIcon}
          onClick={this.startRefreshAuto}
        />
      </Tooltip>
    );
  }

  renderNormalTitle() {
    return (
      <div className={styles['table-header']} id="sl-table-header-search">
        <div
          className={classnames(
            styles['table-header-action-btns'],
            'table-header-action-btns'
          )}
        >
          {this.renderActions()}
          {this.renderBatchActions()}
        </div>
        {this.renderTimeFilter()}
        {this.renderMiddleInHeader()}
        <div className={styles['table-header-right']}>
          {this.renderSearch()}
          <div
            className={classnames(
              styles['table-header-btns'],
              'table-header-btns'
            )}
          >
            {this.renderRefresh()}
            {this.renderDownload()}
            {this.renderCustomButton()}
            {this.renderRefreshAuto()}
          </div>
        </div>
      </div>
    );
  }

  renderTableTitle = () => this.renderNormalTitle();

  renderRowMenu = () => {
    const { hideRow } = this.state;

    const getHideColKeys = (cols) => {
      const results = [];
      this.hideableRows.forEach((item) => {
        if (cols.indexOf(item.value) === -1) {
          results.push(item.value);
        }
      });
      return results;
    };

    return (
      <CustomColumns
        className={styles['column-menu']}
        options={this.hideableRows}
        value={getHideColKeys(hideRow)}
        onChange={this.handleRowHide}
      />
    );
  };

  renderTableFooter = (currentPageData) => {
    const { page, current, pageSize, total, pageSizeOptions } =
      this.props.pagination;
    const { isLoading, hideTotal } = this.props;
    return (
      <CubePagination
        current={page || current || 1}
        pageSize={pageSize}
        onChange={this.handlePageChange}
        currentDataSize={currentPageData.length}
        pageSizeOptions={pageSizeOptions || [10, 20, 50, 100]}
        total={total}
        isLoading={isLoading}
        onFocusChange={this.handleInputFocus}
        hideTotal={hideTotal}
      />
    );
  };

  render() {
    const {
      className,
      data,
      isLoading,
      silentLoading,
      rowKey,
      selectedRowKeys,
      onSelectRowKeys,
      hideHeader,
      getCheckboxProps,
      pagination,
      scrollY,
      expandable,
      isPageByBack = true,
      ableSkipPageByBackend,
      childrenColumnName,
      // scrollX,
    } = this.props;

    let rowSelection = null;

    const newPagination =
      ableSkipPageByBackend || !isPageByBack
        ? {
            ...pagination,
            size: 'small',
          }
        : false;

    let header;
    if (!hideHeader) {
      header = this.renderTableTitle();
    }
    const footer = !(ableSkipPageByBackend || !isPageByBack)
      ? this.renderTableFooter
      : null;

    if (onSelectRowKeys) {
      rowSelection = {
        selectedRowKeys,
        getCheckboxProps,
        onChange: onSelectRowKeys,
        // onSelect: (record, checked, selectedRows) => {
        //   onSelectRowKeys(selectedRows.map(row => row[rowKey]));
        // },
        // onSelectAll: (checked, selectedRows) => {
        //   onSelectRowKeys(selectedRows.map(row => row[rowKey]));
        // }
      };
    }

    const currentColumns = this.getColumns();
    const scroll = {
      // x: 'max-content',
      // x: scrollX || this.hasItemActions() ? 1300 : 1500
    };
    if (scrollY > 0) {
      scroll.y = scrollY || 400;
    }
    return (
      <div className={styles['table-container']}>
        {header}
        <Table
          className={classnames(styles.table, 'sl-table', className)}
          rowKey={rowKey}
          columns={currentColumns}
          dataSource={toJS(data)}
          loading={silentLoading ? false : isLoading}
          onChange={this.handleChange}
          pagination={newPagination}
          rowSelection={rowSelection}
          sortDirections={['ascend', 'descend', 'ascend']}
          // Skyline renders the table header separately from the main table,
          // which can cause the headers and columns to get out of sync when
          // scrolling.
          // To ensure the header and body are scrolled together, we have to
          // manually apply `overflow-x: auto` to `.ant-table-container` and
          // remove the `scroll` prop on Ant table because it causes the
          // `table-layout: fixed` style to be applied to the table element.
          // scroll={scroll}
          showSorterTooltip={false}
          expandable={expandable}
          footer={footer}
          childrenColumnName={childrenColumnName}
        />
      </div>
    );
  }
}

export default inject('rootStore')(BaseTable);
