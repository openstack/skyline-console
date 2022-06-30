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
import { toJS } from 'mobx';
import {
  isEmpty,
  isFunction,
  get,
  isString,
  isEqual,
  isArray,
  has,
  debounce,
} from 'lodash';
import { Menu, Icon, Dropdown, Button, Alert } from 'antd';
import BaseTable from 'components/Tables/Base';
import { isAdminPage } from 'utils/index';
import Notify from 'components/Notify';
import { checkTimeIn } from 'utils/time';
import checkItemPolicy from 'resources/skyline/policy';
import NotFound from 'components/Cards/NotFound';
import { getTags } from 'components/MagicInput';
import { getPath, getLinkRender } from 'utils/route-map';
import styles from './index.less';

const tabOtherHeight = 326;
const otherHeight = 272;
const hintHeight = 50;
const subTabHeight = 50;

export default class BaseList extends React.Component {
  constructor(props, options = {}) {
    super(props);

    this.options = options;

    this.state = {
      filters: {},
      timeFilter: {},
      autoRefresh: true,
      newHints: false,
      tableHeight: this.getTableHeight(),
    };

    this.dataTimerTransition = null;
    this.dataTimerAuto = null;
    this.dataDurationTransition = 10; // fresh data interval when item in transition
    this.dataDurationAuto = 30; // fresh data interval auto
    this.autoRefreshTotalTime = 60 * 10; // seconds
    this.autoRefreshCount = 0; // operation will reset the count, such as: action, select, pagination
    this.autoRefreshCountMax = Math.floor(
      this.autoRefreshTotalTime / this.dataDurationAuto
    );
    this.infoMessage = '';
    this.successMessage = '';
    this.errorMessage = '';
    this.warnMessage = '';
    this.inAction = false;
    this.inSelect = false;
    this.setTableHeight = this.setTableHeight.bind(this);
    this.debounceSetTableHeight = this.debounceSetTableHeight.call(this);
    this.init();
  }

  componentDidMount() {
    this.unsubscribe = this.routing.history.subscribe((location) => {
      if (
        location.pathname === this.props.match.url &&
        location.key === this.props.location.key
      ) {
        const params = this.initFilter;
        const { tags = [] } = getTags(params, this.searchFilters);
        if (!tags.length && !this.filterTimeKey) {
          const { limit, page } = this.store.list;
          this.list.filters = {};
          this.handleFetch({ ...params, limit, page }, true);
        }
      }
    });
    window.addEventListener('resize', this.debounceSetTableHeight);
  }

  componentDidUpdate(prevProps) {
    if (this.inDetailPage) {
      const { detail: oldDetail } = prevProps;
      const { detail: newDetail } = this.props;
      if (
        !isEmpty(oldDetail) &&
        !isEmpty(newDetail) &&
        !isEqual(oldDetail, newDetail)
      ) {
        this.handleRefresh(true);
      }
    }
  }

  componentWillUnmount() {
    this.unsubscribe && this.unsubscribe();
    this.disposer && this.disposer();
    this.unMountActions && this.unMountActions();
    this.stopRefreshTransition();
    this.stopRefreshAuto();
    if (this.clearListUnmount) {
      this.store.clearData && this.store.clearData('listUnmount');
    }
    window.removeEventListener('resize', this.debounceSetTableHeight);
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

  get title() {
    return `${this.name}s`;
  }

  get className() {
    return '';
  }

  get path() {
    const { location: { pathname = '' } = {} } = this.props;
    return pathname || '';
  }

  get inDetailPage() {
    const { detail } = this.props;
    return !!detail;
  }

  get detailName() {
    if (!this.inDetailPage) {
      return '';
    }
    const { detailName } = this.props;
    return detailName;
  }

  get shouldRefreshDetail() {
    return true;
  }

  get location() {
    return this.props.location;
  }

  get isAdminPage() {
    const { pathname } = this.location;
    return isAdminPage(pathname);
  }

  get hasAdminRole() {
    return this.props.rootStore.hasAdminRole;
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

  get prefix() {
    return this.props.match.url;
  }

  get params() {
    return this.props.match.params || {};
  }

  get routing() {
    return this.props.rootStore.routing;
  }

  get list() {
    return this.store.list;
  }

  get isLoading() {
    return this.list.isLoading || this.store.isSubmitting;
  }

  get tips() {
    return [];
  }

  get rowKey() {
    return 'id';
  }

  get hasTab() {
    return false;
  }

  get hasSubTab() {
    return false;
  }

  get hideCustom() {
    return false;
  }

  get hideSearch() {
    return false;
  }

  get hideRefresh() {
    return false;
  }

  get hideDownload() {
    return false;
  }

  get checkEndpoint() {
    return false;
  }

  get endpoint() {
    return '';
  }

  get endpointError() {
    return this.checkEndpoint && !this.endpoint;
  }

  get initFilter() {
    const params = parse(this.location.search.slice(1));
    return params || {};
  }

  get hintHeight() {
    let height = 0;
    if (this.infoMessage) {
      height += hintHeight;
    }
    if (this.warnMessage) {
      height += hintHeight;
    }
    if (this.errorMessage) {
      height += hintHeight;
    }
    if (this.successMessage) {
      height += hintHeight;
    }
    return height;
  }

  get tableTopHeight() {
    if (this.hasSubTab) {
      return tabOtherHeight + subTabHeight;
    }
    if (this.hasTab) {
      return tabOtherHeight;
    }
    return otherHeight;
  }

  getTableHeight() {
    const height = window.innerHeight;
    const id = this.params && this.params.id;
    if (id) {
      return -1;
    }
    return height - this.tableTopHeight - this.hintHeight;
  }

  get tableWidth() {
    return 800;
  }

  get isFilterByBackend() {
    return false;
  }

  get isSortByBackend() {
    return false;
  }

  get isCourier() {
    // 如果是courier的并且是后端分页的，那么需要带数字的分页脚标，因为Courier自带分页且能跳页，而openstack的不支持跳页。
    return false;
  }

  get enabledItemActions() {
    return this.itemActions.filter((item) => !item.action);
  }

  get adminPageHasProjectFilter() {
    return false;
  }

  get transitionStatusList() {
    return [];
  }

  get fetchDataByAllProjects() {
    return true;
  }

  get currentUser() {
    const { user } = this.props.rootStore || {};
    return user || {};
  }

  get currentProjectId() {
    return this.props.rootStore.projectId;
  }

  get fetchDataByCurrentProject() {
    // add project_id to fetch data;
    return false;
  }

  get defaultSortKey() {
    return '';
  }

  get defaultSortOrder() {
    return 'descend';
  }

  get clearListUnmount() {
    return false;
  }

  get itemInTransitionFunction() {
    return (item) => {
      const { status } = item;
      return this.transitionStatusList.indexOf(status) >= 0;
    };
  }

  get ableAutoFresh() {
    return true;
  }

  get actionConfigs() {
    return {
      batchActions: [],
      primaryActions: [],
      rowActions: [],
    };
  }

  get primaryActions() {
    return this.actionConfigs.primaryActions;
  }

  get batchActions() {
    return this.actionConfigs.batchActions;
  }

  get itemActions() {
    return this.actionConfigs.rowActions;
  }

  get searchFilters() {
    return [];
  }

  get expandable() {
    return undefined;
  }

  get filterTimeKey() {
    return undefined;
  }

  get projectFilterKey() {
    return 'project_id';
  }

  get pageSizeOptions() {
    return undefined;
  }

  get hideTotal() {
    return false;
  }

  get primaryActionsExtra() {
    return null;
  }

  get allProjectsKey() {
    return 'all_projects';
  }

  get forceRefreshTopDetailWhenListRefresh() {
    return false;
  }

  setRefreshDataTimerTransition = () => {
    this.stopRefreshAuto();
    if (this.dataTimerTransition) {
      return;
    }
    this.dataTimerTransition = setTimeout(() => {
      this.handleRefresh();
      this.dataTimerTransition = null;
    }, this.dataDurationTransition * 1000);
  };

  setRefreshDataTimerAuto = () => {
    this.stopRefreshTransition();
    if (!this.ableAutoFresh) {
      return;
    }
    const { autoRefresh } = this.state;
    if (!autoRefresh || this.dataTimerAuto) {
      return;
    }
    this.dataTimerAuto = setTimeout(() => {
      this.autoRefreshCount += 1;
      this.handleRefresh();
      this.dataTimerAuto = null;
    }, this.dataDurationAuto * 1000);
  };

  getEmptyProps() {
    return {};
  }

  getEnabledTableProps() {
    const props = this.getTableProps();

    if (isEmpty(this.batchActions)) {
      props.onSelectRowKeys = null;
    }

    return props;
  }

  getCheckboxProps(record) {
    return {
      disabled: false,
      name: record.name,
    };
  }

  getBaseTableProps() {
    const {
      keyword,
      selectedRowKeys,
      total,
      page,
      limit,
      silent,
      sortKey,
      sortOrder,
      timerFilter,
    } = this.list;
    const pagination = {
      total,
      current: Number(page),
      pageSize: limit || 10,
      // eslint-disable-next-line no-shadow
      showTotal: (total) => t('Total {total} items', { total }),
      showSizeChanger: true,
    };
    if (this.pageSizeOptions) {
      pagination.pageSizeOptions = this.pageSizeOptions;
    }
    const { autoRefresh, tableHeight } = this.state;
    return {
      resourceName: this.name,
      detailName: this.detailName,
      data: this.getDataSource(),
      // data:data,
      columns: this.getColumns(),
      filters: this.getFilters(),
      timerFilter,
      searchFilters: this.getSearchFilters(),
      keyword,
      pagination,
      primaryActions: this.primaryActions,
      batchActions: this.batchActions,
      itemActions: this.itemActions,
      getCheckboxProps: this.getCheckboxProps,
      isLoading: this.isLoading,
      silentLoading: silent,
      rowKey: this.rowKey,
      selectedRowKeys: toJS(selectedRowKeys),
      scrollY: tableHeight,
      sortKey,
      sortOrder,
      defaultSortKey: this.defaultSortKey,
      defaultSortOrder: this.defaultSortOrder,
      getDownloadData: this.getDownloadData,
      containerProps: this.props,
      expandable: this.expandable,
      showTimeFilter: !!this.filterTimeKey,
      filterTimeDefaultValue: this.filterTimeDefaultValue,
      isPageByBack: this.isFilterByBackend,
      isSortByBack: this.isSortByBackend,
      isCourier: this.isCourier,
      autoRefresh,
      startRefreshAuto: this.startRefreshAuto,
      stopRefreshAuto: this.onStopRefreshAuto,
      onClickAction: this.onClickAction,
      onFinishAction: this.onFinishAction,
      onCancelAction: this.onCancelAction,
      dataDurationAuto: this.dataDurationAuto,
      handleInputFocus: this.handleInputFocus,
      hideTotal: this.hideTotal,
      hideDownload: this.hideDownload,
      primaryActionsExtra: this.primaryActionsExtra,
      isAdminPage: this.isAdminPage,
      initFilter: this.initFilter,
      ...this.getEnabledTableProps(),
    };
  }

  onStopRefreshAuto = () => {
    this.setState({
      autoRefresh: false,
    });
    this.stopRefreshAuto();
  };

  onClickAction = () => {
    this.inAction = true;
    this.autoRefreshCount = 0;
  };

  onFinishAction = () => {
    this.inAction = false;
    this.handleSelectRowKeys([]);
    this.handleRefresh(true);
  };

  onCancelAction = () => {
    this.inAction = false;
    this.getDataSource();
  };

  handleInputFocus = (value) => {
    this.inAction = value;
    if (!value) {
      this.setRefreshDataTimerAuto();
    }
  };

  getTableProps() {
    return {
      onRefresh: this.handleRefresh,
      onFetch: this.handleFetch,
      onFetchBySort: this.handleFetchBySort,
      onSelectRowKeys: this.handleSelectRowKeys,
      onFilterChange: this.handleFilterChange,
      hideCustom: this.hideCustom,
      hideSearch: this.hideSearch,
      hideRefresh: this.hideRefresh,
      hideAutoRefresh: !this.ableAutoFresh,
    };
  }

  getData({ silent, ...params } = {}) {
    silent && (this.list.silent = true);
    const newParams = {
      ...this.props.match.params,
      ...params,
      sortKey:
        params.sortKey || (this.isSortByBackend && this.defaultSortKey) || '',
      sortOrder:
        params.sortOrder ||
        (this.isSortByBackend && this.defaultSortOrder) ||
        '',
    };
    if (!this.isAdminPage && this.fetchDataByCurrentProject) {
      newParams.project_id = this.currentProjectId;
    } else if (
      this.isAdminPage &&
      this.fetchDataByAllProjects &&
      this.allProjectsKey
    ) {
      newParams[this.allProjectsKey] = true;
    }
    if (this.isFilterByBackend) {
      this.fetchListWithTry(() =>
        this.fetchDataByPage(this.updateFetchParamsByPage(newParams))
      );
    } else {
      this.fetchListWithTry(() =>
        this.fetchData(this.updateFetchParams(newParams))
      );
    }
  }

  getDataWithPolicy(params) {
    if (!this.currentUser || isEmpty(this.currentUser)) {
      return;
    }
    if (this.endpointError) {
      return;
    }
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
        status: 401,
      };
      Notify.errorWithDetail(
        error,
        t('Unable to get {name}.', { name: this.name.toLowerCase() })
      );
      this.list.isLoading = false;
      this.list.silent = false;
      return;
    }
    this.getData(params);
  }

  setTableHeight() {
    const currentTableHeight = this.getTableHeight();
    const { tableHeight } = this.state;
    if (currentTableHeight !== tableHeight) {
      this.setState({
        tableHeight: currentTableHeight,
      });
    }
  }

  getColumns() {
    return [];
  }

  fetchListWithTry = async (func) => {
    try {
      func && (await func());
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log('fetch list error', e);
      const { message = '', data, status } = (e || {}).response || e || {};
      if (status === 401) {
        const title = t('The session has expired, please log in again.');
        Notify.errorWithDetail(null, title);
      } else if (status === 500) {
        const systemErr = t('System is error, please try again later.');
        const title = `${t('Get {name} error.', {
          name: this.name.toLowerCase(),
        })} ${systemErr}`;
        Notify.errorWithDetail(null, title);
      } else {
        const error = {
          message: data || message || e || '',
          status,
        };
        Notify.errorWithDetail(
          error,
          t('Get {name} error.', { name: this.name.toLowerCase() })
        );
      }
      this.list.isLoading = false;
      this.list.silent = false;
    }
  };

  updateFetchParamsByPage = (params) => params;

  updateFetchParams = (params) => params;

  fetchDataByPage = async (params) => {
    await this.store.fetchListByPage(params);
    this.list.silent = false;
  };

  fetchData = async (newParams) => {
    await this.store.fetchList(newParams);
    this.list.silent = false;
  };

  fetchDownloadData = async (params) => {
    let result = [];
    if (this.isFilterByBackend) {
      result = await this.downloadStore.fetchListByPage(
        this.updateFetchParamsByPage(params)
      );
    } else {
      result = await this.downloadStore.fetchList(
        this.updateFetchParams(params)
      );
    }
    return result;
  };

  getDownloadData = async ({ ...params } = {}) => {
    // only used for download all and pagination by backend
    const { filters } = this.state;
    const newParams = {
      ...this.props.match.params,
      ...params,
      ...filters,
      sortKey:
        params.sortKey || (this.isSortByBackend && this.defaultSortKey) || '',
      sortOrder:
        params.sortOrder ||
        (this.isSortByBackend && this.defaultSortOrder) ||
        '',
    };
    if (!this.isAdminPage && this.fetchDataByCurrentProject) {
      newParams.project_id = this.currentProjectId;
    } else if (
      this.isAdminPage &&
      this.fetchDataByAllProjects &&
      this.allProjectsKey
    ) {
      newParams[this.allProjectsKey] = true;
    }
    const result = await this.fetchDownloadData(newParams);
    return result;
  };

  startRefreshAuto = () => {
    this.autoRefreshCount = 0;
    this.setState({
      autoRefresh: true,
    });
    this.handleRefresh();
  };

  stopRefreshAuto = () => {
    clearTimeout(this.dataTimerAuto);
    this.dataTimerAuto = null;
  };

  stopRefreshTransition = () => {
    clearTimeout(this.dataTimerTransition);
    this.dataTimerTransition = null;
  };

  getFilteredValue = (dataIndex) => this.list.filters[dataIndex];

  checkIsProjectFilter = (item) => item.name === this.projectFilterKey;

  getSearchFilters = () => {
    const filters = this.searchFilters;
    if (!this.isAdminPage) {
      return filters;
    }
    if (!this.adminPageHasProjectFilter) {
      return filters;
    }
    const projectItem = filters.find((it) => this.checkIsProjectFilter(it));
    if (projectItem) {
      return filters;
    }
    return [
      ...filters,
      {
        label: t('Project ID'),
        name: this.projectFilterKey,
      },
    ];
  };

  filterDataByTime = (data) => {
    if (!this.filterTimeKey) {
      return true;
    }
    const { timeFilter: { value = 0, start, end } = {} } = this.state;
    if (value === 0) {
      return true;
    }
    const dataTime = get(data, this.filterTimeKey, 0);
    if (value !== 1) {
      return checkTimeIn(dataTime, new Date().getTime() - value, null);
    }
    return checkTimeIn(dataTime, start, end);
  };

  checkFilterInclude = (key) => {
    const item = this.searchFilters.find((it) => it.name === key);
    if (has(item, 'include')) {
      return item.include;
    }
    if (has(item, 'options')) {
      return false;
    }
    return true;
  };

  filterData = (data) => {
    if (!this.filterDataByTime(data)) {
      return false;
    }
    const { filters: filtersInState } = this.state;
    if (Object.keys(filtersInState).length === 1 && filtersInState.keywords) {
      const { keywords } = filtersInState;
      const item = Object.values(data).find(
        (value) =>
          (isString(value) || isArray(value)) && value.indexOf(keywords) >= 0
      );
      return !!item;
    }
    const failed = Object.keys(filtersInState).find((key) => {
      const value = get(data, key);
      const filterValue = filtersInState[key];
      const { filterFunc } = this.getSearchFilters().find(
        (i) => i.name === key
      );
      if (filterFunc) {
        return !filterFunc(value, filterValue);
      }

      const isInclude = this.checkFilterInclude(key);
      if (isString(value) && isString(filterValue)) {
        if (isInclude) {
          return value.toLowerCase().indexOf(filterValue.toLowerCase()) < 0;
        }
        return value.toLowerCase() !== filterValue.toLowerCase();
      }
      return !isEqual(value, filterValue);
    });
    return !failed;
  };

  getDataSource = () => {
    const { data, filters = {} } = this.list;
    const { timeFilter = {} } = this.state;
    const { id, tab, ...rest } = filters;
    const newFilters = rest;
    let items = [];
    if (this.isFilterByBackend) {
      items = toJS(data);
    } else {
      items = (toJS(data) || []).filter((it) =>
        this.filterData(it, toJS(newFilters), toJS(timeFilter))
      );
      this.updateList({ total: items.length });
    }
    const hasTransData = items.some((item) =>
      this.itemInTransitionFunction(item)
    );
    if (hasTransData) {
      this.setRefreshDataTimerTransition();
    } else {
      this.setRefreshDataTimerAuto();
    }
    this.updateHintsByData(items);
    this.setTableHeight();
    return items;
  };

  getFilters = () => {
    const { filters } = this.list;
    const params = parse(this.location.search.slice(1));
    return {
      ...params,
      ...toJS(filters),
    };
  };

  handleMoreMenuClick = (item) => (e, key) => {
    const action = this.enabledItemActions.find(
      (_action) => _action.key === key
    );
    if (action && action.onClick) {
      action.onClick(item);
    }
  };

  refreshDetailData = () => {
    const { refreshDetail } = this.props;
    refreshDetail && refreshDetail();
  };

  handleRefresh = (force) => {
    const { inAction, inSelect } = this;
    if (inAction || (inSelect && !force)) {
      return;
    }
    if (!force && this.autoRefreshCount >= this.autoRefreshCountMax) {
      return;
    }
    if (force) {
      this.autoRefreshCount = 0;
    }
    const { page, limit, sortKey, sortOrder, filters } = this.list;
    const params = {
      page,
      limit,
      sortKey,
      sortOrder,
      ...toJS(filters),
      silent: !force,
    };
    this.handleFetch(params, true);
    if (
      this.inDetailPage &&
      (force || this.forceRefreshTopDetailWhenListRefresh) &&
      this.shouldRefreshDetail
    ) {
      this.refreshDetailData();
    }
  };

  updateList = (newObj) => {
    if (!this.list) {
      return;
    }
    if (this.list.update) {
      this.list.update(newObj);
    } else {
      Object.keys(newObj).forEach((key) => {
        this.list[key] = newObj[key];
      });
    }
  };

  handleFetch = (params, refresh) => {
    if (refresh && !this.isFilterByBackend) {
      this.getDataWithPolicy(params);
      return;
    }
    // eslint-disable-next-line no-unused-vars
    const { sortKey, limit, page, current, sortOrder, ...rest } = params;
    if (page !== this.list.page || limit !== this.list.limit) {
      this.autoRefreshCount = 0;
    }
    // const newParams = reverse === undefined ? rest : params;
    if (this.isFilterByBackend) {
      this.getDataWithPolicy({ ...params, ...(this.list.filters || {}) });
      // this.routing.query(newParams, refresh);
    } else {
      this.updateList({
        page,
        limit,
        sortKey,
        sortOrder,
      });
    }
  };

  handleFetchBySort = (params) => {
    if (!this.isSortByBackend) {
      const { sortKey, limit, page, sortOrder } = params;
      this.updateList({
        page,
        limit,
        sortKey,
        sortOrder,
      });
      return;
    }
    const newParams = {
      ...params,
      page: 1,
    };
    this.handleFetch(newParams, true);
  };

  handleFilterChange = (filters, timeFilter) => {
    const { page, limit, sortKey, sortOrder, ...rest } = filters;
    if (this.isFilterByBackend) {
      this.list.filters = filters;
      // this.list.timeFilter = timeFilter;
      this.setState(
        {
          timeFilter,
        },
        () => {
          this.handleFetch(filters, true);
        }
      );
      // this.routing.query(filters, true);
    } else {
      this.updateList({
        page,
        sortKey,
        sortOrder,
        filters: rest,
        // timeFilter,
      });
      this.setState({
        filters: rest,
        timeFilter,
      });
    }
  };

  handleSelectRowKeys = (params) => {
    this.store.setSelectRowKeys('list', params);
    if (!params || params.length === 0) {
      this.inSelect = false;
      this.getDataSource();
    } else {
      this.inSelect = true;
      this.autoRefreshCount = 0;
    }
  };

  onCloseSuccessHint = () => {};

  debounceSetTableHeight() {
    return debounce(this.setTableHeight, 1000);
  }

  // eslint-disable-next-line no-unused-vars
  updateHintsByOthers() {
    if (this.updateHints) {
      this.updateHints();
      setTimeout(this.setTableHeight, 0);
      this.setState({
        newHints: true,
      });
    }
  }

  // eslint-disable-next-line no-unused-vars
  updateHintsByData(data) {}

  init() {
    this.store = { list: {} };
    this.downloadStore = {};
  }

  renderMore = (field, record) => {
    if (isEmpty(this.enabledItemActions)) {
      return null;
    }

    const content = this.renderMoreMenu(record);

    if (content === null) {
      return null;
    }

    return (
      <Dropdown content={content} trigger="click" placement="bottomRight">
        <Button icon="more" type="flat" />
      </Dropdown>
    );
  };

  renderMoreMenu = (record) => {
    const items = this.enabledItemActions.map((action) => {
      const show = isFunction(action.show)
        ? action.show(record)
        : action.show || true;
      if (!show) return null;

      return (
        <Menu.MenuItem key={action.key}>
          <Icon name={action.icon} /> <span>{action.text}</span>
        </Menu.MenuItem>
      );
    });

    if (items.every((item) => item === null)) {
      return null;
    }

    return <Menu onClick={this.handleMoreMenuClick(record)}>{items}</Menu>;
  };

  renderTable() {
    try {
      const props = this.getBaseTableProps();
      return <BaseTable {...props} />;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e);
      const link = this.getRoutePath('overview');
      return <NotFound title={this.name} link={link} codeError />;
    }
  }

  renderInfoHint() {
    if (!this.infoMessage) {
      return null;
    }
    return (
      <Alert
        message={this.infoMessage}
        type="info"
        showIcon
        className={styles.hint}
      />
    );
  }

  renderSuccessHint() {
    if (!this.successMessage) {
      return null;
    }
    return (
      <Alert
        message={this.successMessage}
        type="success"
        showIcon
        closable
        className={styles.hint}
        onClose={this.onCloseSuccessHint}
      />
    );
  }

  renderWarnHint() {
    if (!this.warnMessage) {
      return null;
    }
    return (
      <Alert
        message={this.warnMessage}
        type="warning"
        showIcon
        className={styles.hint}
      />
    );
  }

  renderErrorHint() {
    if (!this.errorMessage) {
      return null;
    }
    return (
      <Alert
        message={this.errorMessage}
        type="error"
        showIcon
        closable
        className={styles.hint}
      />
    );
  }

  renderHint() {
    const { newHints } = this.state;
    if (
      !newHints &&
      !this.infoMessage &&
      !this.warnMessage &&
      !this.successMessage &&
      !this.errorMessage
    ) {
      return null;
    }
    return (
      <div className={classnames(styles.hints, 'list-hints')}>
        {this.renderInfoHint()}
        {this.renderSuccessHint()}
        {this.renderWarnHint()}
        {this.renderErrorHint()}
      </div>
    );
  }

  renderHeader() {
    return null;
  }

  render() {
    if (this.endpointError) {
      const link = this.getRoutePath('overview');
      return <NotFound title={this.name} link={link} endpointError />;
    }
    const table = this.renderTable();
    return (
      <div
        className={classnames(styles.wrapper, 'list-container', this.className)}
      >
        {this.renderHeader()}
        {this.renderHint()}
        {table}
      </div>
    );
  }
}
