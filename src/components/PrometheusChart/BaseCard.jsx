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
import { Card, Select } from 'antd';
import VisibleObserver from 'components/VisibleObserver';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import isEqual from 'react-fast-compare';
import FetchPrometheusStore from './store/FetchPrometheusStore';
import style from './style.less';

@observer
class BaseFetch extends Component {
  static propTypes = {
    constructorParams: PropTypes.shape({
      requestType: PropTypes.oneOf(['current', 'range']).isRequired,
      metricKey: PropTypes.string.isRequired,
      formatDataFn: PropTypes.func.isRequired,
      typeKey: PropTypes.string,
      deviceKey: PropTypes.string,
    }).isRequired,
    params: PropTypes.object,
    currentRange: PropTypes.array.isRequired,
    interval: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    extra: PropTypes.func,
    renderContent: PropTypes.func.isRequired,
    visibleHeight: PropTypes.number,
  };

  static defaultProps = {
    // src/pages/monitor/containers/PhysicalNode/index.less:91
    // 为了不在视区范围内的时候，仍然撑开元素。防止出现在视区的时候挤开下面的元素。（由下往上翻）
    visibleHeight: 100,
  };

  constructor(props) {
    super(props);
    const { constructorParams } = this.props;

    this.store = new FetchPrometheusStore(constructorParams);
  }

  componentDidMount() {
    this.getData();
  }

  componentDidUpdate(prevProps) {
    if (!isEqual(prevProps, this.props)) {
      this.getData();
    }
  }

  getData() {
    const { params, currentRange, interval } = this.props;
    this.store.fetchData({ params, currentRange, interval });
  }

  renderExtra() {
    const { extra } = this.props;
    return (
      <>
        {this.store.device && this.store.devices.length !== 0 && (
          <Select
            defaultValue={this.store.device}
            style={{ width: 150, marginRight: 16 }}
            options={this.store.devices.map((i) => ({
              label: i,
              value: i,
            }))}
            onChange={(e) => this.store.handleDeviceChange.call(this.store, e)}
          />
        )}
        {extra && extra(this.store)}
      </>
    );
  }

  render() {
    const { isLoading } = this.store;
    const { visibleHeight } = this.props;
    return (
      <Card
        className={style.remove_extra_padding}
        bodyStyle={{
          // padding 24
          minHeight: visibleHeight + 48,
        }}
        title={this.props.title}
        extra={this.renderExtra()}
        loading={isLoading}
      >
        <VisibleObserver style={{ width: '100%', height: visibleHeight }}>
          {(visible) => (visible ? this.props.renderContent(this.store) : null)}
        </VisibleObserver>
      </Card>
    );
  }
}

export default BaseFetch;
