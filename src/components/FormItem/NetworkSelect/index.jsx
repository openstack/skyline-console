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
import { Row, Col, Form, Tooltip, Input } from 'antd';
import Select from 'components/FormItem/Select';
import PropTypes from 'prop-types';
import { ipValidate } from 'utils/validate';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { ipTypeOptions } from 'resources/neutron/network';
// import { getIpInitValue } from 'resources/instance';
import styles from './index.less';

const { isIPv4, isIpv6, isIpInRangeAll } = ipValidate;

export default class NetworkSelect extends React.Component {
  static propTypes = {
    // eslint-disable-next-line react/no-unused-prop-types
    networks: PropTypes.array,
    // eslint-disable-next-line react/no-unused-prop-types
    subnets: PropTypes.array,
    value: PropTypes.object,
    ipType: PropTypes.number,
    name: PropTypes.string,
    optionsByIndex: PropTypes.bool,
    index: PropTypes.number,
  };

  static defaultProps = {
    networks: [],
    subnets: [],
    value: {},
    ipType: 0,
    name: 'network',
    optionsByIndex: false,
    index: 0,
  };

  constructor(props) {
    super(props);
    const { value } = props;
    const { network, subnet, ip, ipType } = value;
    this.state = {
      network: network || null,
      subnet: subnet || null,
      ip: ip || '0.0.0.0',
      ipType: ipType || 0,
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (
      nextProps.networks !== prevState.networks ||
      nextProps.subnets !== prevState.subnets
    ) {
      const { networks, subnets } = nextProps;
      return {
        networks,
        subnets,
      };
    }
    return null;
  }

  componentDidMount() {
    this.checkNetwork();
  }

  onChange = () => {
    this.checkNetwork(() => {
      const { onChange } = this.props;
      const { network, subnet, ip, ipType, validateStatus, errorMsg } =
        this.state;
      const networkOptions = this.getNetworkOptions();
      const subnetOptions = this.getSubnetOptions();
      const networkOption = networkOptions.find((it) => it.value === network);
      const subnetOption = subnetOptions.find((it) => it.value === subnet);
      const ipTypeOption = ipTypeOptions.find((it) => it.value === ipType);
      if (onChange) {
        onChange({
          network,
          subnet,
          ip,
          ipType,
          networkOption,
          subnetOption,
          ipTypeOption,
          validateStatus,
          errorMsg,
        });
      }
    });
  };

  onNetworkChange = (value) => {
    const { subnets } = this.state;
    const subs = subnets.filter((it) => it.network_id === value);
    const subnet = subs.length ? subs[0].id : null;
    this.setState(
      {
        network: value,
        subnet,
        ipType: 0,
        // defaultIp: this.getIpInitValue(subnet),
        ip: undefined,
      },
      this.onChange
    );
  };

  onSubnetChange = (value) => {
    this.setState(
      {
        subnet: value,
        // defaultIp: this.getIpInitValue(value),
        ip: undefined,
      },
      this.onChange
    );
  };

  // getIpInitValue = (subnet) => {
  //   const { subnets } = this.state;
  //   const subnetItem = subnets.find(it => it.id === subnet);
  //   return getIpInitValue(subnetItem);
  // }

  onTypeChange = (value) => {
    this.setState(
      {
        ipType: value,
      },
      this.onChange
    );
  };

  onIPChange = (e) => {
    const { value } = e.currentTarget;
    this.setState(
      {
        ip: value,
      },
      this.onChange
    );
  };

  checkNetwork = (callback) => {
    const { network, subnets, subnet, ip, ipType } = this.state;
    const item = subnets.find((it) => it.id === subnet);
    const { allocation_pools: pools } = item || {};

    if (!network) {
      this.setState(
        {
          errorMsg: t('Please select a network!'),
          validateStatus: 'error',
        },
        callback
      );
      return;
    }
    // if (!subnet) {
    //   this.setState({
    //     errorMsg: t('Please select a subnet!'),
    //     validateStatus: 'error',
    //   }, callback);
    //   return;
    // }
    if (ipType === 1 && !isIPv4(ip) && !isIpv6(ip)) {
      this.setState(
        {
          errorMsg: t('Please input a valid ip!'),
          validateStatus: 'error',
        },
        callback
      );
      return;
    }
    if (pools && ipType === 1) {
      const okPool = pools.find((pool) =>
        isIpInRangeAll(ip, pool.start, pool.end)
      );
      if (!okPool) {
        this.setState(
          {
            errorMsg: t('The ip is not within the allocated pool!'),
            validateStatus: 'error',
          },
          callback
        );
        return;
      }
    }
    this.setState(
      {
        errorMsg: undefined,
        validateStatus: 'success',
      },
      callback
    );
  };

  getNetworkOptions = () => {
    const { networks } = this.state;
    const { optionsByIndex, index } = this.props;
    let data = [...networks];
    if (optionsByIndex && index < networks.length) {
      data = [networks[index]];
    }
    return data.map((it) => ({
      label: it.name,
      value: it.id,
    }));
  };

  getSubnetOptions = () => {
    const { network, subnets } = this.state;
    if (!network) {
      return [];
    }
    return subnets
      .filter((it) => it.network_id === network)
      .map((it) => ({
        label: (
          <div>
            <span>{it.name}</span>
            <span className={styles['subnet-options-cidr']}>{it.cidr}</span>
          </div>
        ),
        name: it.name,
        value: it.id,
      }));
  };

  renderNetwork() {
    const { network } = this.state;
    return (
      <Col span={6}>
        <Select
          options={this.getNetworkOptions()}
          value={network}
          onChange={this.onNetworkChange}
          placeholder={t('please select network')}
        />
      </Col>
    );
  }

  renderSubnet() {
    const { network, subnet, ipType } = this.state;
    if (!network || !ipType) {
      return null;
    }
    return (
      <Col span={6}>
        <Select
          options={this.getSubnetOptions()}
          value={subnet}
          placeholder={t('please select subnet')}
          onChange={this.onSubnetChange}
        />
      </Col>
    );
  }

  renderIpType() {
    const { network, ipType } = this.state;
    if (!network) {
      return null;
    }
    return (
      <Col span={6}>
        <Select
          value={ipType}
          options={ipTypeOptions}
          onChange={this.onTypeChange}
        />
      </Col>
    );
  }

  renderIp() {
    const { subnet, subnets, ipType, ip, network } = this.state;
    if (!network) {
      return null;
    }
    if (ipType === 0) {
      const totalAllocationPools = [];
      const subnetsForCurrentNetwork = subnets.filter(
        (s) => s.network_id === network
      );
      subnetsForCurrentNetwork.forEach((sub) => {
        const { allocation_pools: pools = [] } = sub;
        pools.forEach((pool) => {
          totalAllocationPools.push(pool);
        });
      });
      const details = totalAllocationPools.map((pool, index) => (
        <span key={`pool.start.${index}`} style={{ marginRight: 10 }}>
          {pool.start}--{pool.end}
        </span>
      ));
      const tips = (
        <span>
          <span className={styles.label}>{t('Allocation Pools')}: </span>
          <span className={styles.content}>{details}</span>
        </span>
      );
      return <Col span={12}>{tips}</Col>;
    }
    if (!subnet) {
      return null;
    }
    const item = subnets.find((it) => it.id === subnet);
    if (!item) {
      return null;
    }
    const { allocation_pools: pools } = item;

    const detailsDiv = pools.map((pool, index) => (
      <div key={`pool.start.${index}`}>
        {pool.start}--{pool.end}
      </div>
    ));
    const tips = (
      <span>
        <span className={styles.label}>{t('Allocation Pools')}: </span>
        <span className={styles.content}>{detailsDiv}</span>
        <span className={styles.content}>
          {t(
            'Please make sure this IP address be available to avoid creating VM failure.'
          )}
        </span>
      </span>
    );
    return (
      <Col span={6}>
        <Input value={ip} onChange={this.onIPChange} />
        <Tooltip title={tips} color="white">
          <QuestionCircleOutlined />
        </Tooltip>
      </Col>
    );
  }

  render() {
    const { validateStatus, errorMsg } = this.state;
    const { name } = this.props;
    return (
      <Form.Item
        className={styles['network-select']}
        name={name}
        validateStatus={validateStatus}
        help={errorMsg}
      >
        <Row gutter={24}>
          {this.renderNetwork()}
          {this.renderIpType()}
          {this.renderSubnet()}
          {this.renderIp()}
        </Row>
      </Form.Item>
    );
  }
}
