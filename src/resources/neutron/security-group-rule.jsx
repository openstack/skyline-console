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
import { isNumber } from 'lodash';
import { Link } from 'react-router-dom';
import { getOptions } from 'utils';

export const ipProtocols = [
  { value: 'ah', label: t('AH') },
  { value: 'dccp', label: t('DCCP') },
  { value: 'egp', label: t('EGP') },
  { value: 'esp', label: t('ESP') },
  { value: 'gre', label: t('GRE') },
  { value: 'igmp', label: t('IGMP') },
  { value: 'ipv6-encap', label: t('IPv6-Encap') },
  { value: 'ipv6-frag', label: t('IPv6-Frag') },
  { value: 'ipv6-icmp', label: t('IPv6-ICMP') },
  { value: 'ipv6-nonxt', label: t('IPv6-NoNxt') },
  { value: 'ipv6-opts', label: t('IPv6-Opts') },
  { value: 'ipv6-route', label: t('IPv6-Route') },
  { value: 'ospf', label: t('OSPF') },
  { value: 'pgm', label: t('PGM') },
  { value: 'rsvp', label: t('RSVP') },
  { value: 'sctp', label: t('SCTP') },
  { value: 'udplite', label: t('UDPLite') },
  { value: 'vrrp', label: t('VRRP') },
];

export const directions = {
  ingress: t('Ingress'),
  egress: t('Egress'),
};

export const protocols = (protocol) => {
  if (isNumber(protocol)) {
    return protocol;
  }
  if (!protocol) {
    return t('Any');
  }
  if (protocol === 'any') {
    return t('Any');
  }
  return protocol.toUpperCase();
};

export const getSelfColumns = (self) => [
  {
    title: t('Direction'),
    dataIndex: 'direction',
    render: (value) => directions[value] || value,
  },
  {
    title: t('Ether Type'),
    dataIndex: 'ethertype',
  },
  {
    title: t('IP Protocol'),
    dataIndex: 'protocol',
    render: (value) => protocols(value),
    valueRender: 'noValue',
    isHideable: true,
  },
  {
    title: t('Port Range'),
    dataIndex: 'port_range',
    isHideable: true,
  },
  {
    title: t('Description'),
    dataIndex: 'description',
    isHideable: true,
  },
  {
    title: t('Remote IP Prefix'),
    dataIndex: 'remote_ip_prefix',
    render: (value, record) =>
      value || (record.ethertype === 'IPv4' ? '0.0.0.0/0' : '::/0'),
    isHideable: true,
  },
  {
    title: t('Remote Group Id'),
    dataIndex: 'remote_group_id',
    isHideable: true,
    render: (value) => {
      const url = self.getDetailUrl(value);
      return <div>{value ? <Link to={url}>{value}</Link> : '-'}</div>;
    },
  },
  {
    title: t('ICMP Type/ICMP Code'),
    dataIndex: 'icmpTypeCode',
    valueRender: 'noValue',
    isHideable: true,
    splitColumnForDownload: false,
  },
];

export const filterParams = [
  {
    label: t('Remote IP Prefix'),
    name: 'remote_ip_prefix',
    filterFunc: (record, value) => {
      const recordValue = record || '0.0.0.0/0';
      return recordValue.includes(value);
    },
  },
  {
    label: t('Direction'),
    name: 'direction',
    options: getOptions(directions),
  },
  {
    label: t('Ether Type'),
    name: 'ethertype',
    options: [
      {
        label: 'IPv4',
        key: 'IPv4',
      },
      {
        label: 'IPv6',
        key: 'IPv6',
      },
    ],
  },
];

export const mapperRule = (data) => {
  let icmpTypeCode = '';
  let port_range = 'Any';
  const {
    ethertype,
    protocol,
    port_range_min,
    port_range_max,
    remote_ip_prefix,
    ...rest
  } = data;
  const prMinNum = parseInt(port_range_min, 10);
  const prMaxNum = parseInt(port_range_max, 10);
  // const defaultIP = ethertype === 'IPv4' ? '0.0.0.0/0' : '::/0';
  if (prMinNum && prMaxNum) {
    port_range = prMinNum !== prMaxNum ? `${prMinNum} : ${prMaxNum}` : prMinNum;
  }
  if (protocol === 'icmp' && prMaxNum) {
    icmpTypeCode = `${prMinNum} / ${prMaxNum}`;
    port_range = '-';
  }
  return {
    ethertype,
    protocol: protocol || 'any',
    remote_ip_prefix,
    port_range,
    icmpTypeCode,
    ...rest,
  };
};
