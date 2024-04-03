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
import globalContainerStore, { ContainerStore } from 'stores/swift/container';
import { bytesFilter } from 'utils/index';
import { allCanChangePolicy } from 'resources/skyline/policy';
import { getStrFromTimestamp } from 'utils/time';
import { swiftEndpoint } from 'client/client/constants';
import actionConfigs from './actions';

function PopUpContent({ name }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let timeout = null;
    (async function () {
      setLoading(true);
      const cb = await new ContainerStore().fetchDetail({ name });
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
        <Col span={8}>{t('Object Count')}</Col>
        <Col span={12}>{data.object_count}</Col>
      </Row>
      <Row>
        <Col span={8}>{t('Size')}</Col>
        <Col span={12}>{bytesFilter(data.used)}</Col>
      </Row>
      <Row>
        <Col span={8}>{t('Created At')}</Col>
        <Col span={12}>{getStrFromTimestamp(data.timestamp)}</Col>
      </Row>
      <Row>
        <Col span={8}>{t('Storage Policy')}</Col>
        <Col span={12}>{data.storage_policy}</Col>
      </Row>
      <Row>
        <Col span={8}>{t('Public Access')}</Col>
        <Col span={12}>
          {data.link ? (
            <a
              type="link"
              href={data.link.endsWith('/') ? data.link : `${data.link}/`}
              target="_blank"
              rel="noreferrer"
            >
              {t('Click To View')}
            </a>
          ) : (
            t('Private')
          )}
        </Col>
      </Row>
    </>
  );
  return (
    <div key={`container_${name}`} style={{ width: 300 }}>
      {content}
    </div>
  );
}

export class Container extends Base {
  init() {
    this.store = globalContainerStore;
  }

  get policy() {
    return allCanChangePolicy;
  }

  get checkEndpoint() {
    return true;
  }

  get endpoint() {
    return swiftEndpoint();
  }

  get name() {
    return t('containers');
  }

  get actionConfigs() {
    return actionConfigs;
  }

  get hideCustom() {
    return true;
  }

  get hideDownload() {
    return true;
  }

  get rowKey() {
    return 'name';
  }

  getColumns = () => {
    const columns = [
      {
        title: t('Name'),
        dataIndex: 'name',
        render: (name, record) =>
          this.getLinkRender('containerDetail', name || record.id, {
            id: record.id,
          }),
      },
      {
        title: t('Size'),
        dataIndex: 'bytes',
        valueRender: 'bytes',
      },
      {
        title: t('Last Updated'),
        dataIndex: 'last_modified',
        isHideable: true,
        valueRender: 'sinceTime',
      },
      {
        title: t('Detail Info'),
        dataIndex: 'detail',
        isHideable: true,
        render: (_, data) => {
          const content = <PopUpContent name={data.name} />;
          return (
            <Popover content={content} destroyTooltipOnHide trigger="click">
              <span className="link-class">{t('Detail Info')}</span>
            </Popover>
          );
        },
      },
    ];
    return columns;
  };

  get searchFilters() {
    return [
      {
        label: t('Name'),
        name: 'name',
      },
    ];
  }
}

export default inject('rootStore')(observer(Container));
