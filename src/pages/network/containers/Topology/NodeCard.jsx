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
import { generateId } from 'utils/index';
import { getLocalTimeStr } from 'utils/time';
import { routerStatus } from 'resources/neutron/router';
import { Descriptions, Popover, Button, Avatar } from 'antd';
import { Link } from 'react-router-dom';
import routerImage from 'asset/image/router.png';
import styles from './index.less';

export default class NodeCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  get statusMap() {
    return {
      SHUTOFF: {
        status: 'default',
        text: t('Shutoff'),
      },
      ACTIVE: {
        color: 'green',
        text: t('Active'),
      },
    };
  }

  get detailInfos() {
    const {
      data: { subnets },
    } = this.props;
    const subnetsNoHa = subnets.filter(
      (it) => it.name.indexOf('HA subnet tenant') === -1
    );
    return [
      {
        title: t('Name'),
        dataIndex: 'name',
        render: (name, record) => {
          if (name) {
            return (
              <Link to={`/network/router/detail/${record.id}`}>{name}</Link>
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
        render: (value) => routerStatus[value] || value,
      },
      {
        title: t('External Fixed IP'),
        dataIndex: 'external_gateway_info',
        isHideable: true,
        render: (value) =>
          ((value || {}).external_fixed_ips || []).map((it) => (
            <span key={it.ip_address}>
              {it.ip_address}
              <br />
            </span>
          )) || '-',
      },
      {
        title: t('Subnet'),
        dataIndex: 'subnets',
        render: (value) => {
          if (!subnetsNoHa[0]) {
            return '-';
          }
          const subnetConn = subnetsNoHa.filter(
            (it) => value.indexOf(it.id) !== -1
          );
          return subnetConn.map((it) => (
            <span key={it.id}>
              {it.name} ({it.cidr})<br />
            </span>
          ));
        },
        // render: value => subnets.filter(it => it.id === value)[0].name,
      },
    ];
  }

  detailButtons = () => [
    {
      name: t('Clear Gateway'),
      click: null,
    },
    {
      name: t('Associate IP'),
      click: null,
    },
    {
      name: t('Associate Network'),
      click: null,
    },
    {
      name: t('delete'),
      type: 'danger',
      click: null,
    },
  ];

  renderCardInfos(detailData) {
    const descriptions = this.detailInfos.map((it) => {
      const { title, dataIndex, render } = it;
      let desc;
      if (this.isLoading || !detailData || !detailData.id) {
        desc = '-';
      } else {
        desc = render
          ? render(detailData[dataIndex], detailData)
          : detailData[dataIndex];
        if (
          (dataIndex === 'create_time' ||
            dataIndex === 'update_time' ||
            dataIndex === 'created_at') &&
          !render
        ) {
          desc = getLocalTimeStr(desc);
        }
        if (desc === undefined) {
          desc = '-';
        }
      }
      return {
        label: title,
        content: desc,
      };
    });
    return (
      <Descriptions column={1} className={styles['descriptions-item']}>
        {descriptions.map((it) => (
          <Descriptions.Item label={it.label} key={`label-${generateId()}`}>
            {it.content}
          </Descriptions.Item>
        ))}
      </Descriptions>
    );
  }

  renderButton() {
    const buttons = this.detailButtons();
    return (
      <div className={styles['card-button']}>
        {buttons.map((button) => (
          <Button type={button.type ? button.type : 'primary'}>
            {button.name}
          </Button>
        ))}
      </div>
    );
  }

  renderCard(width, detailData) {
    return (
      <div style={{ width }}>
        {this.renderCardInfos(detailData)}
        {/* {this.renderButton()} */}
      </div>
    );
  }

  renderTitle(type, name) {
    return (
      <div className={styles['node-card-title']}>{`${type}: ${name}`}</div>
    );
  }

  render() {
    const { x, y } = this.props;
    // eslint-disable-next-line react/prop-types
    const {
      data: { routers },
      infoIndex,
    } = this.props;
    const detailData = routers[infoIndex];
    return (
      <div
        className={styles['node-tooltips']}
        style={{ top: `${y}px`, left: `${x}px` }}
      >
        <Popover
          placement="rightTop"
          content={this.renderCard(430, detailData)}
          title={this.renderTitle(t('Router'), detailData.name)}
        >
          <div
            style={{
              textAlign: 'center',
              width: '50px',
              height: '50px',
              overflow: 'hidden',
            }}
          >
            <Avatar src={routerImage} shape="square" size={30} />
            <div style={{ transform: 'scale(0.9,1)' }}>{detailData.name}</div>
          </div>
        </Popover>
      </div>
    );
  }
}
