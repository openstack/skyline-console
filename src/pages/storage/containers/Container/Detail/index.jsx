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

import React, { useEffect, useState } from 'react';
import { observer, inject } from 'mobx-react';
import { Popover, Col, Row, Skeleton } from 'antd';
import Base from 'containers/List';
import globalObjectStore, { ObjectStore } from 'stores/swift/object';
import { bytesFilter } from 'utils/index';
import { allCanReadPolicy } from 'resources/skyline/policy';
import { toJS } from 'mobx';
import { isEqual } from 'lodash';
import { isFolder } from 'resources/swift/container';
import { getStrFromTimestamp } from 'utils/time';
import styles from './index.less';
import actionConfigs from './actions';

function PopUpContent({ item }) {
  const { container, name, shortName } = item;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let timeout = null;
    (async function () {
      setLoading(true);
      const cb = await new ObjectStore().fetchDetail({ container, name });
      timeout = setTimeout(() => {
        setLoading(false);
        setData(cb);
      }, 200);
    })();
    return () => {
      clearTimeout(timeout);
    };
  }, []);
  const content = loading ? (
    <Skeleton loading={loading} />
  ) : (
    <>
      <Row>
        <Col span={8}>{t('Name')}</Col>
        <Col span={12} style={{ wordBreak: 'break-all' }}>
          {shortName}
        </Col>
      </Row>
      {data.etag && (
        <Row>
          <Col span={8}>{t('Hash')}</Col>
          <Col span={12}>{data.etag}</Col>
        </Row>
      )}
      <Row>
        <Col span={8}>{t('Content Type')}</Col>
        <Col span={12} style={{ wordBreak: 'break-all' }}>
          {data.contentType}
        </Col>
      </Row>
      <Row>
        <Col span={8}>{t('Created At')}</Col>
        <Col span={12}>{getStrFromTimestamp(data.timestamp)}</Col>
      </Row>
      <Row>
        <Col span={8}>{t('Size')}</Col>
        <Col span={12}>{bytesFilter(data.size || item.bytes)}</Col>
      </Row>
      {!isFolder(item) && (
        <Row>
          <Col span={8}>{t('Origin File Name')}</Col>
          <Col span={12} style={{ wordBreak: 'break-all' }}>
            {decodeURIComponent(data.originFileName)}
          </Col>
        </Row>
      )}
    </>
  );
  return (
    <div key={`object_${name}`} style={{ width: 300 }}>
      {content}
    </div>
  );
}

export class ContainerObject extends Base {
  init() {
    this.store = globalObjectStore;
  }

  get policy() {
    return allCanReadPolicy;
  }

  get name() {
    return t('container objects');
  }

  get rowKey() {
    return 'name';
  }

  get actionConfigs() {
    return actionConfigs;
  }

  get clearListUnmount() {
    return true;
  }

  get hasTab() {
    return true;
  }

  get hideDownload() {
    return true;
  }

  get isInFolder() {
    const { folder } = this.params;
    return !!folder;
  }

  get ableAutoFresh() {
    return false;
  }

  get primaryActionsExtra() {
    const { hasCopy, container } = this.store;
    return {
      hasCopy,
      container,
    };
  }

  getCheckboxProps(record) {
    if (isFolder(record)) {
      return {
        disabled: true,
        name: record.shortName,
      };
    }
  }

  componentDidUpdate(prevProps) {
    if (!isEqual(this.props.match.params, prevProps.match.params)) {
      this.handleRefresh(true);
    }
  }

  getRequestFolder = (folder) => {
    if (!folder) {
      return '';
    }
    const str = decodeURIComponent(folder);
    if (str[str.length - 1] !== '/') {
      return `${str}/`;
    }
    return str;
  };

  updateFetchParams = (params) => {
    const { folder } = this.params;
    return {
      ...params,
      folder: this.getRequestFolder(folder),
    };
  };

  getColumns = () => [
    {
      title: t('Name'),
      dataIndex: 'shortName',
      render: (name, record) => {
        const { type, container } = record;
        if (type === 'folder') {
          const str = encodeURIComponent(record.name);
          return this.getLinkRender('folderDetail', name, {
            container,
            folder: str,
          });
        }
        return name;
      },
    },
    {
      title: t('Size'),
      dataIndex: 'bytes',
      isHideable: true,
      valueRender: 'formatSize',
      render: (value, data) => {
        if (data.type === 'folder') {
          return '-';
        }
        return bytesFilter(value);
      },
    },
    {
      title: t('Last Updated'),
      dataIndex: 'last_modified',
      isHideable: true,
      valueRender: 'sinceTime',
    },
    {
      title: t('Detail'),
      dataIndex: 'detail',
      isHideable: true,
      render: (_, data) => {
        const content = <PopUpContent item={data} />;
        return (
          <Popover content={content} destroyTooltipOnHide trigger="click">
            <span className="link-class">{t('Detail')}</span>
          </Popover>
        );
      },
    },
  ];

  get searchFilters() {
    return [
      {
        label: t('Name'),
        name: 'shortName',
      },
    ];
  }

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
    if (force) {
      params.page = 1;
    }
    this.handleFetch(params, true);
    if (this.inDetailPage && force && this.shouldRefreshDetail) {
      this.refreshDetailData();
    }
  };

  renderHeader() {
    const { container = '', folder = '' } = this.params || {};
    const folders = decodeURIComponent(folder)
      .split('/')
      .filter((it) => !!it);
    const containerLink = {
      path: this.getRoutePath('containerDetail', { id: container }),
      link: this.getLinkRender('containerDetail', container, { id: container }),
    };
    const items = [containerLink];
    const folderLinks = folders.map((it, index) => {
      const path = folders.slice(0, index + 1).join('/');
      return {
        path: this.getRoutePath('folderDetail', {
          container,
          folder: encodeURIComponent(path),
        }),
        link: this.getLinkRender('folderDetail', it, {
          container,
          folder: encodeURIComponent(path),
        }),
      };
    });
    items.push(...folderLinks);
    const next = <span className={styles['item-next']}>&gt;</span>;
    const itemLinks = items.map((it, index) => {
      return (
        <span key={it.path}>
          {it.link} {index < items.length - 1 && next}
        </span>
      );
    });
    return (
      <div className={styles['link-header']}>
        <span className={styles['link-title']}>{t('Current Path: ')}</span>
        {itemLinks}
      </div>
    );
  }
}

export default inject('rootStore')(observer(ContainerObject));
