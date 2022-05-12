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
import { Popover, Avatar } from 'antd';
import { instanceStatus } from 'resources/nova/instance';
import instanceImage from 'asset/image/instance.png';
import ImageType from 'components/ImageType';
import { Link } from 'react-router-dom';
import styles from './index.less';
import NodeCard from './NodeCard';

export default class InstanceCard extends NodeCard {
  constructor(props) {
    super(props);
    this.state = {};
  }

  get detailInfos() {
    return [
      {
        title: t('Name'),
        dataIndex: 'name',
        width: 100,
        render: (name, record) => {
          if (name) {
            return (
              <Link to={`/compute/instance/detail/${record.id}`}>{name}</Link>
            );
          }
          return '-';
        },
      },
      {
        title: t('UUID'),
        dataIndex: 'id',
      },
      {
        title: t('Status'),
        dataIndex: 'status',
        isHideable: true,
        render: (value) => instanceStatus[value && value.toLowerCase()] || '-',
      },
      {
        title: t('Image'),
        dataIndex: 'image_os_distro',
        isHideable: true,
        render: (value, record) => (
          <ImageType type={value} title={record.image_name} />
        ),
        stringify: (_, record) => record.image_name,
      },
      {
        title: t('Fixed IP'),
        dataIndex: 'fixed_addresses',
        isHideable: true,
        width: 120,
        render: (fixed_addresses) => {
          if (!fixed_addresses.length) {
            return '-';
          }
          return fixed_addresses.map((it) => (
            <span key={it}>
              {it}
              <br />
            </span>
          ));
        },
        stringify: (value) => value.join(',') || '-',
      },
      {
        title: t('Floating IP'),
        dataIndex: 'floating_addresses',
        isHideable: true,
        width: 120,
        render: (addresses) => {
          if (!addresses.length) {
            return '-';
          }
          return addresses.map((it) => (
            <span key={it}>
              {it}
              <br />
            </span>
          ));
        },
      },
    ];
  }

  detailButtons = () => {
    const {
      data: { servers },
      infoIndex,
    } = this.props;
    const { status } = servers[infoIndex];
    const statusData =
      status === 'SHUTOFF'
        ? [
            {
              name: t('Power On'),
              click: null,
            },
          ]
        : [
            {
              name: t('Power Off'),
              click: null,
            },
          ];
    return [
      ...statusData,
      {
        name: t('Associate IP'),
        click: null,
      },
      {
        name: t('Add network'),
        click: null,
      },
      {
        name: t('VNC'),
        click: null,
      },
      {
        name: t('Delete'),
        type: 'danger',
        click: null,
      },
    ];
  };

  render() {
    const { x, y } = this.props;
    const {
      data: { servers },
      infoIndex,
    } = this.props;
    const detailData = servers[infoIndex];
    return (
      <div
        className={styles['node-tooltips']}
        style={{ top: `${y}px`, left: `${x - 8}px` }}
      >
        <Popover
          placement="rightTop"
          content={this.renderCard(435, detailData)}
          title={this.renderTitle(t('Instance'), detailData.name)}
        >
          <div
            style={{
              textAlign: 'center',
              width: '66px',
              height: '50px',
              overflow: 'hidden',
            }}
          >
            <Avatar src={instanceImage} shape="square" size={28} />
            <div>{detailData.name}</div>
          </div>
        </Popover>
      </div>
    );
  }
}
