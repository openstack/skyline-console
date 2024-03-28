import { Select } from 'antd';
import { get } from 'lodash';

import React, { useState } from 'react';

const { Option } = Select;
const useNodeSelect = (defaultNode) => {
  const [node, setNode] = useState(defaultNode);
  const [nodes, setNodes] = useState([]);

  const handleNodeChange = (e) => {
    const key = getKey();
    setNode(nodes.find((i) => i.metric[key] === e));
  };

  const Nodes = () => {
    if (!nodes.length) {
      return null;
    }
    const key = getKey();
    return (
      <div style={{ marginBottom: 16 }}>
        <span style={{ color: 'black', fontSize: 14, fontWeight: 400 }}>
          Node:{' '}
        </span>
        <Select
          value={node.metric[key]}
          onChange={handleNodeChange}
          style={{ minWidth: 150 }}
        >
          {nodes.map((item) => (
            <Option key={item.metric[key]} value={item.metric[key]}>
              {item.metric[key]}
            </Option>
          ))}
        </Select>
      </div>
    );
  };

  return [node, Nodes, setNode, setNodes];

  function getKey() {
    const hostname = get(node, 'metric.hostname', false);
    let key = 'instance';
    if (hostname) {
      key = 'hostname';
    }
    return key;
  }
};

export default useNodeSelect;
