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
import { merge } from 'lodash';
import { Button, Modal } from 'antd';
import { Chart, Line, Tooltip } from 'bizcharts';
import ArrowsAltOutlined from '@ant-design/icons/ArrowsAltOutlined';

import { ChartType, getXScale } from './utils/utils';
import {
  baseLineProps,
  baseToolTipProps,
  multilineProps,
} from './utils/baseProps';
import BaseCard from './BaseCard';

const ChartCard = (props) => {
  const { chartProps } = props;
  const renderContent = (contextValue) => {
    const {
      height,
      scale,
      chartType,
      toolTipProps = baseToolTipProps,
    } = chartProps;

    const { data } = contextValue;

    scale.x = merge(
      {},
      scale.x || {},
      getXScale(props.fetchDataParams.currentRange)
    );

    let lineProps;
    switch (chartType) {
      case ChartType.ONELINE:
      case ChartType.ONELINEDEVICES:
        lineProps = baseLineProps;
        break;
      case ChartType.MULTILINE:
      case ChartType.MULTILINEDEVICES:
        lineProps = multilineProps;
        break;
      default:
        lineProps = baseLineProps;
    }

    return (
      <Chart autoFit padding="auto" data={data} height={height} scale={scale}>
        <Line {...lineProps} />
        <Tooltip {...toolTipProps} />
      </Chart>
    );
  };

  const extra = () => {
    const {
      title,
      createFetchParams,
      handleDataParams,
      fetchDataParams,
      isModal = false,
      fetchPrometheusFunc,
    } = props;
    const defaultNode = {};
    const { params: fParams = {} } = fetchDataParams;
    const { instance, hostname, ...rest } = fParams;
    if (fParams) {
      if (instance) {
        defaultNode.instance = instance;
      } else if (hostname) {
        defaultNode.hostname = hostname;
      }
    }

    return (
      <>
        {props.extra && props.extra()}
        {!isModal && (
          <Button
            type="text"
            icon={<ArrowsAltOutlined />}
            onClick={() => {
              Modal.info({
                icon: null,
                content: (function () {
                  const BaseContent =
                    require('./component/BaseContent').default;
                  return (
                    <BaseContent
                      renderNodeSelect={false}
                      defaultNode={{
                        metric: defaultNode,
                      }}
                      visibleHeight={props.chartProps.height}
                      chartConfig={{
                        fetchPrometheusFunc,
                        chartCardList: [
                          {
                            title,
                            createFetchParams,
                            handleDataParams,
                            fetchDataParams: {
                              params: rest,
                            },
                            chartProps,
                            span: 24,
                            isModal: true,
                          },
                        ],
                      }}
                    />
                  );
                })(),
                width: 1200,
                okText: t('OK'),
              });
            }}
          />
        )}
      </>
    );
  };

  return (
    <BaseCard
      {...props}
      renderContent={renderContent}
      visibleHeight={props.chartProps.height}
      extra={extra}
    />
  );
};

export default ChartCard;
