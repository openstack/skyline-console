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

import React, { useState, useEffect } from 'react';
import { Button, Spin } from 'antd';
import { SyncOutlined } from '@ant-design/icons';

import {
  defaultOneHourAgo,
  getRange,
} from 'components/PrometheusChart/utils/utils';
import Charts from './Charts';
import useIntervals from './hooks/useIntervals';
import useRangeSelect from './hooks/useRangeSelect';
import useNodeSelect from './hooks/useNodeSelect';
import styles from '../style.less';
import { defaultGetNodes } from '../utils/fetchNodes';
import BaseContentContext from './context';

const BaseContent = (props) => {
  const {
    renderTimeRangeSelect,
    chartConfig,
    renderNodeSelect,
    fetchNodesFunc,
    defaultNode,
    children,
    type,
  } = props;

  const [node, Nodes, setNode, setNodes] = useNodeSelect(defaultNode);

  const [range, Selector, groupIndex, setRange] = useRangeSelect(
    defaultOneHourAgo()
  );

  const [interval, Intervals] = useIntervals(range);

  const [isLoading, setIsLoading] = useState(true);

  const [isFetchingNodes, setIsFetchingNodes] = useState(true);

  const handleRefresh = async (refresh = false) => {
    setIsLoading(true);
    if (renderNodeSelect) {
      setIsFetchingNodes(true);
      const ret = await fetchNodesFunc();
      setNodes(ret);
      if (!node || refresh) {
        setNode(ret[0]);
      }
      // refresh data by force(not in the selected )
      if (refresh && groupIndex !== 4) {
        setRange(getRange(groupIndex));
      }
      setIsFetchingNodes(false);
      setIsLoading(false);
    } else {
      setTimeout(() => {
        setIsLoading(false);
      }, 300);
    }
  };

  const passedContextValue = {
    interval,
    range,
    node,
  };

  useEffect(() => {
    handleRefresh();
  }, [interval, range]);

  useEffect(() => {
    handleRefresh(true);
  }, [type]);

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 300);
  }, [node]);

  return (
    <div className={styles['base-content-container']}>
      <BaseContentContext.Provider value={passedContextValue}>
        {(renderTimeRangeSelect || renderNodeSelect) && (
          <Button
            type="default"
            icon={<SyncOutlined />}
            onClick={() => handleRefresh(true)}
            className={styles.refresh}
          />
        )}
        {renderTimeRangeSelect && (
          <div className={styles.header}>
            <Selector />
            <Intervals />
          </div>
        )}
        {renderNodeSelect && (isFetchingNodes ? <Spin /> : <Nodes />)}
        {(renderNodeSelect && isFetchingNodes) ||
        (isLoading &&
          chartConfig?.chartCardList?.length !== 0 &&
          chartConfig?.topCardList?.length !== 0) ? null : (
          <Charts {...chartConfig} />
        )}
        {(renderNodeSelect && isFetchingNodes) || isLoading ? (
          <Spin />
        ) : (
          children
        )}
      </BaseContentContext.Provider>
    </div>
  );
};

BaseContent.defaultProps = {
  renderNodeSelect: true,
  renderTimeRangeSelect: true,
  fetchNodesFunc: defaultGetNodes,
  defaultNode: undefined,
};

export default BaseContent;
