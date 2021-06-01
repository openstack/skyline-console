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
import { isArray, get, isString } from 'lodash';
import Status from 'components/Status';
import { renderFilterMap } from 'utils/index';

export const getDefaultSorter = (dataIndex) => (a, b) => {
  const dIndex = isArray(dataIndex) ? dataIndex.join('.') : dataIndex;
  const aValue = get(a, dIndex);
  const bValue = get(b, dIndex);
  let result = true;
  if (bValue !== null && bValue !== undefined) {
    result = aValue > bValue;
  }
  return result ? 1 : -1;
};

export const getColumnSorter = (column, props) => {
  const { isSortByBack } = props;
  const { sorter, dataIndex } = column;
  if (!isSortByBack) {
    return sorter === false ? null : sorter || getDefaultSorter(dataIndex);
  }
  return sorter === false ? null : true;
};

export const getSortOrder = (column, props) => {
  const { sortKey, sortOrder } = props;
  return (
    (sortKey === column.sortKey || sortKey === column.dataIndex) && sortOrder
  );
};

export const updateColumnSort = (newColumn, props) => {
  const { defaultSortKey, defaultSortOrder, isSortByBack } = props;
  if (
    isSortByBack &&
    defaultSortKey &&
    defaultSortOrder &&
    (newColumn.dataIndex === defaultSortKey ||
      newColumn.sortKey === defaultSortKey)
  ) {
    newColumn.defaultSortOrder = defaultSortOrder;
  }
};

export const checkIsStatusColumn = (dataIndex, isStatus) => {
  if (isStatus) {
    return true;
  }
  if (isStatus !== undefined) {
    return false;
  }
  return (
    isString(dataIndex) &&
    (dataIndex.toLowerCase().indexOf('status') >= 0 ||
      dataIndex.toLowerCase().indexOf('state') >= 0)
  );
};

export const getStatusRender = (render) => (value) => {
  const text = render ? render(value) : value;
  // 'display block' fix for missing text in the case of narrow screen
  return <Status status={value} text={text} style={{ display: 'block' }} />;
};

export const getValueRenderFunc = (valueRender) => {
  if (isString(valueRender)) {
    return renderFilterMap[valueRender];
  }
  return null;
};

export const getRender = (valueRender) => {
  if (!valueRender) {
    return null;
  }
  return (value) => {
    const func = getValueRenderFunc(valueRender);
    if (func) {
      return func(value);
    }
    return '-';
  };
};

export const getProjectId = (record) =>
  record.project_id || record.owner || record.fingerprint || record.tenant;

export const projectRender = (value, record) => (
  <>
    <div>{getProjectId(record)}</div>
    <div>{value || '-'}</div>
  </>
);
