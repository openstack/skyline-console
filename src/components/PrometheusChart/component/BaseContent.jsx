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
import { observer } from 'mobx-react';
import NodeSelect from 'components/PrometheusChart/component/NodeSelect';
import TimeRangeSelect from 'components/PrometheusChart/component/TimeRangeSelect';
import styles from './index.less';
import BaseMonitorStore from '../store/BaseMonitorStore';

@observer
class BaseContent extends Component {
  static propTypes = {
    renderChartCards: PropTypes.func.isRequired,
    renderTimeRangeSelect: PropTypes.bool,
    renderNodeSelect: PropTypes.bool,
    fetchNodesFunc: PropTypes.func,
  };

  static defaultProps = {
    renderTimeRangeSelect: true,
    renderNodeSelect: true,
  };

  constructor(props) {
    super(props);
    this.store = new BaseMonitorStore({
      fetchNodesFunc: this.props.fetchNodesFunc,
    });
  }

  componentDidMount() {
    const { renderNodeSelect } = this.props;
    if (renderNodeSelect) {
      this.store.getNodes();
    } else {
      this.store.setLoading(false);
    }
  }

  render() {
    const { renderChartCards, renderTimeRangeSelect, renderNodeSelect } =
      this.props;
    return (
      <div className={styles.header}>
        {renderTimeRangeSelect && (
          <TimeRangeSelect
            style={{ marginBottom: 24 }}
            store={this.store}
            renderNodeSelect={renderNodeSelect}
          />
        )}
        {renderNodeSelect && (
          <NodeSelect style={{ marginBottom: 24 }} store={this.store} />
        )}
        {renderChartCards(this.store)}
      </div>
    );
  }
}

export default BaseContent;
