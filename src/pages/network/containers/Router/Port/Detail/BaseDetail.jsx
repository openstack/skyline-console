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
import { inject, observer } from 'mobx-react';
import Base from 'containers/BaseDetail';
import { isEmpty } from 'lodash';

export class BaseDetail extends Base {
  get leftCards() {
    const cards = [this.portInfo];
    const {
      dns_assignment: dnsAssignment = [],
      fixed_ips: fixedIps = [],
      deviceOwner = {},
    } = this.detailData;
    if (dnsAssignment.length > 0) {
      cards.push(this.dnsAssignment);
    }
    if (fixedIps.length > 0) {
      cards.push(this.fixedIps);
    }
    if (deviceOwner && this.isAdmin) {
      cards.push(this.deviceOwner);
    }
    cards.push(this.binding);
    return cards;
  }

  get portInfo() {
    const options = [
      {
        label: t('Network Name'),
        dataIndex: 'network_name',
      },
      {
        label: t('Network ID'),
        dataIndex: 'network_id',
      },
      {
        label: t('MAC Address'),
        dataIndex: 'mac_address',
      },
      {
        label: t('Port Security Enabled'),
        dataIndex: 'port_security_enabled',
        valueRender: 'yesNo',
      },
      {
        label: t('DNS Name'),
        dataIndex: 'dns_name',
        hidden: !this.isAdmin,
      },
    ];
    if (this.detailData.mac_state) {
      options.push({
        label: t('MAC Learning State'),
        dataIndex: 'mac_state',
      });
    }
    if (this.detailData.qos_policy_id) {
      options.push({
        label: t('QoS Policy ID'),
        dataIndex: 'qos_policy_id',
      });
    }
    return {
      title: t('Port Info'),
      options,
    };
  }

  get dnsAssignment() {
    const host = this.detailData.dns_assignment[0] || {};
    const { hostname, ip_address } = host;
    const options = [
      {
        label: t('Hostname'),
        dataIndex: 'dns_assignment',
        render: () => hostname,
      },
      {
        label: t('IP Address'),
        dataIndex: 'ip_address',
        render: () => ip_address,
      },
    ];
    return {
      title: t('DNS Assignment'),
      options,
    };
  }

  get fixedIps() {
    const ip = this.detailData.fixed_ips[0] || {};
    const { ip_address, subnet_id } = ip;
    const options = [
      {
        label: t('IP Address'),
        dataIndex: 'ip_address',
        render: () => ip_address,
      },
      {
        label: t('Subnet ID'),
        dataIndex: 'subnet_id',
        render: () => subnet_id,
      },
    ];
    return {
      title: t('Fixed IPs'),
      options,
    };
  }

  get deviceOwner() {
    const options = [
      {
        label: t('Device Owner'),
        dataIndex: 'device_owner',
      },
      {
        label: t('Device ID'),
        dataIndex: 'device_id',
      },
    ];
    return {
      title: t('Attached Device'),
      options,
    };
  }

  get binding() {
    let options = [
      {
        label: t('VNIC Type'),
        dataIndex: 'binding__vnic_type',
      },
    ];
    if (this.detailData.binding__host_id) {
      const host = [
        {
          label: t('Host'),
          dataIndex: 'binding__host_id',
        },
        {
          label: t('Profile'),
          dataIndex: 'binding__profile',
          render: (value) => {
            if (!value || isEmpty(value)) {
              return '-';
            }
            return Object.keys(value).map((key) => (
              <div key={key}>
                <b>{key}</b>: <b>{value[key]}</b>
              </div>
            ));
          },
        },
        {
          label: t('VIF Type'),
          dataIndex: 'binding__vif_type',
        },
        {
          label: t('VIF Details'),
          dataIndex: 'binding__vif_details',
          render: (value) => {
            if (!value || isEmpty(value)) {
              return '-';
            }
            return Object.keys(value).map((key) => (
              <div key={key}>
                <b>{key}</b> <span>{value[key].toString()}</span>
              </div>
            ));
          },
        },
      ];
      options = [...options, ...host];
    }
    return {
      title: t('Binding'),
      options,
    };
  }
}

export default inject('rootStore')(observer(BaseDetail));
