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
import { Select, Spin } from 'antd';
import { observer } from 'mobx-react';

const { Option } = Select;

@observer
class NodeSelect extends Component {
  render() {
    const { style } = this.props;
    const { node, nodes, isLoading, handleNodeChange } = this.props.store;
    return (
      <div style={style}>
        {isLoading ? (
          <Spin />
        ) : (
          <>
            <span style={{ color: 'black', fontSize: 14, fontWeight: 400 }}>
              Node:{' '}
            </span>
            <Select
              value={node.metric.instance}
              onChange={handleNodeChange}
              getPopupContainer={(triggerNode) => triggerNode.parentNode}
              style={{ minWidth: 150 }}
            >
              {nodes.map((item) => (
                <Option key={item.metric.instance} value={item.metric.instance}>
                  {item.metric.instance}
                </Option>
              ))}
            </Select>
          </>
        )}
      </div>
    );
  }
}

export default NodeSelect;
