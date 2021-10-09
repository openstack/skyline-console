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

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Col, Empty, Spin } from 'antd';
import { get } from 'lodash';
import { SubnetStore } from 'stores/neutron/subnet';

class LocalSubnet extends Component {
  constructor(props) {
    super(props);
    this.state = {
      subnets: [],
      isLoading: true,
    };
  }

  componentDidUpdate(prevProps) {
    const { local_ep_group_id } = this.props;
    const { local_ep_group_id: prevLEGI } = prevProps;
    if (local_ep_group_id !== prevLEGI) {
      this.getSubnets();
    }
  }

  get currentEndpoints() {
    const { data, local_ep_group_id } = this.props;
    return get(
      data.find((i) => i.id === local_ep_group_id),
      'endpoints',
      []
    );
  }

  async getSubnets() {
    this.setState({
      isLoading: true,
    });
    const promises = this.currentEndpoints.map((i) =>
      new SubnetStore().fetchDetail({ id: i })
    );
    const ret = await Promise.all(promises);
    this.setState({
      subnets: ret,
      isLoading: false,
    });
  }

  render() {
    const { local_ep_group_id } = this.props;
    const { subnets, isLoading } = this.state;
    if (!local_ep_group_id) {
      return (
        <Col>
          <Empty />
        </Col>
      );
    }
    if (isLoading) {
      return (
        <Col>
          <Spin />
        </Col>
      );
    }
    return (
      <>
        {this.currentEndpoints.map((item, idx) => {
          return (
            <Col span={24} key={`cep_${idx}`}>
              {get(subnets[idx], 'cidr')}
            </Col>
          );
        })}
      </>
    );
  }
}

LocalSubnet.propTypes = {
  data: PropTypes.array,
  local_ep_group_id: PropTypes.string,
};

LocalSubnet.defaultProps = {
  data: [],
  local_ep_group_id: undefined,
};

export default LocalSubnet;
