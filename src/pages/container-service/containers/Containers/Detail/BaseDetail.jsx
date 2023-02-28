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

import Base from 'containers/BaseDetail';
import React from 'react';
import { inject, observer } from 'mobx-react';
import {
  containerStatus,
  imageDrivers,
  exitPolicies,
  containerTaskStatus,
} from 'resources/zun/container';
import { stringifyContent } from 'utils/content';
import { isEmpty } from 'lodash';

export class BaseDetail extends Base {
  get leftCards() {
    const cards = [this.baseInfoCard, this.otherCard];
    const { stats } = this.detailData;
    if (!isEmpty(stats)) {
      cards.push(this.statsCard);
    }
    return cards;
  }

  get rightCards() {
    return [this.specCard];
  }

  get baseInfoCard() {
    const { image, imageInfo } = this.detailData || {};
    const imageUrl = imageInfo
      ? this.getLinkRender('imageDetail', imageInfo.name, {
          id: imageInfo.id,
        })
      : image;

    const options = [
      {
        label: t('Image'),
        content: imageUrl,
      },
      {
        label: t('Image Driver'),
        dataIndex: 'image_driver',
        valueMap: imageDrivers,
      },
      {
        label: t('Status Detail'),
        dataIndex: 'status_detail',
        valueMap: containerStatus,
      },
      {
        label: t('Status Reason'),
        dataIndex: 'status_reason',
      },
      {
        label: t('Task State'),
        dataIndex: 'task_state',
        valueMap: containerTaskStatus,
      },
    ];

    return {
      title: t('Base Info'),
      options,
    };
  }

  get otherCard() {
    const options = [
      {
        label: t('Host'),
        dataIndex: 'host',
      },
      {
        label: t('Hostname'),
        dataIndex: 'hostname',
      },
      {
        label: t('Runtime'),
        dataIndex: 'runtime',
      },
      {
        label: t('CMD'),
        dataIndex: 'command',
        render: stringifyContent,
      },
      {
        label: t('ENTRYPOINT'),
        dataIndex: 'entrypoint',
        render: stringifyContent,
      },
      {
        label: t('Workdir'),
        dataIndex: 'workdir',
      },
      {
        label: t('Environment'),
        dataIndex: 'environment',
        render: stringifyContent,
      },
      {
        label: t('Labels'),
        dataIndex: 'labels',
        render: stringifyContent,
      },
    ];

    return {
      title: t('Others'),
      options,
    };
  }

  get specCard() {
    const options = [
      {
        label: t('CPU (Core)'),
        dataIndex: 'cpu',
      },
      {
        label: t('Memory (MiB)'),
        dataIndex: 'memory',
      },
      {
        label: t('Disk (GiB)'),
        dataIndex: 'disk',
      },
      {
        label: t('Exit Policy'),
        dataIndex: 'restart_policy',
        render: (value) => {
          if (isEmpty(value)) {
            return '-';
          }
          const { Name, MaximumRetryCount } = value;
          return (
            <div>
              <p>
                {t('Name')}: {exitPolicies[Name]}
              </p>
              <p>
                {t('Max Retry')}: {MaximumRetryCount}
              </p>
            </div>
          );
        },
      },
      {
        label: t('Enable auto remove'),
        dataIndex: 'auto_remove',
        valueRender: 'yesNo',
      },
      {
        label: t('Enable auto heal'),
        dataIndex: 'auto_heal',
        valueRender: 'yesNo',
      },
      {
        label: t('Enable interactive mode'),
        dataIndex: 'interactive',
        valueRender: 'yesNo',
      },
      {
        label: t('Enable Health Check'),
        dataIndex: 'healthcheck',
        render: (value) => {
          if (isEmpty(value)) {
            return t('No');
          }
          const { interval, retries, test, timeout } = value;
          return (
            <div>
              <p>
                {t('Health Check CMD')}: {test}
              </p>
              <p>
                {t('Health Check Interval')}: {interval} s
              </p>
              <p>
                {t('Health Check Retries')}: {retries}
              </p>
              <p>
                {t('Health Check Timeout')}: {timeout} s
              </p>
            </div>
          );
        },
      },
      {
        label: t('Addresses'),
        dataIndex: 'addresses',
        render: stringifyContent,
      },
      {
        label: t('IP Address'),
        dataIndex: 'addrs',
        render: (value = []) => (
          <>
            {value.length
              ? value.map((it) => {
                  return <div key={it.addr}>{it.addr}</div>;
                })
              : '-'}
          </>
        ),
      },
      {
        label: t('Networks'),
        dataIndex: 'networks',
        render: (value = []) => (
          <>
            {value.length
              ? value.map((it) => {
                  const link = this.getLinkRender('networkDetail', it.name, {
                    id: it.id,
                  });
                  return <div key={it.id}>{link}</div>;
                })
              : '-'}
          </>
        ),
      },
      {
        label: t('Subnets'),
        dataIndex: 'subnets',
        render: (value = []) => (
          <>
            {value.length
              ? value.map((it) => {
                  const link = this.getLinkRender('subnetDetail', it.name, {
                    networkId: it.network_id,
                    id: it.id,
                  });
                  return <div key={it.id}>{link}</div>;
                })
              : '-'}
          </>
        ),
      },
      {
        label: t('Ports'),
        dataIndex: 'ports',
        render: (value = []) => (
          <>
            {value.length
              ? value.map((it) => {
                  return <div key={it}>{it}</div>;
                })
              : '-'}
          </>
        ),
      },
      {
        label: t('Security Groups'),
        dataIndex: 'security_groups',
        render: (value = []) => (
          <>
            {value.length
              ? value.map((it) => {
                  const link = this.getLinkRender('securityGroupDetail', it, {
                    id: it,
                  });
                  return <div key={it}>{link}</div>;
                })
              : '-'}
          </>
        ),
      },
    ];

    return {
      title: t('Spec'),
      labelCol: 4,
      options,
    };
  }

  get statsCard() {
    const options = [
      {
        label: t('BLOCK I/O(B)'),
        dataIndex: 'stats[BLOCK I/O(B)]',
      },
      {
        label: t('NET I/O(B)'),
        dataIndex: 'stats[NET I/O(B)]',
      },
      {
        label: t('CPU %'),
        dataIndex: 'stats[CPU %]',
        render: (value = 0) => value.toFixed(4),
      },
      {
        label: t('MEM LIMIT (MiB)'),
        dataIndex: 'stats[MEM LIMIT(MiB)]',
      },
      {
        label: t('MEM USAGE (MiB)'),
        dataIndex: 'stats[MEM USAGE(MiB)]',
        render: (value = 0) => value.toFixed(4),
      },
      {
        label: t('MEM %'),
        dataIndex: 'stats[MEM %]',
        render: (value = 0) => value.toFixed(4),
      },
    ];

    return {
      title: t('Stats Information'),
      options,
    };
  }
}

export default inject('rootStore')(observer(BaseDetail));
