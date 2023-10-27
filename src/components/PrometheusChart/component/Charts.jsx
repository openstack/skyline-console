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

import React, { useContext } from 'react';
import { get, merge } from 'lodash';

import { Col, Row } from 'antd';
import { handleResponses } from '../utils/dataHandler';
import styles from './styles.less';
import BaseCard from '../BaseCard';
import ChartCard from '../ChartCard';
import BaseContentContext from './context';

const Charts = (props) => {
  const {
    baseTopCardProps,
    baseChartProps,
    topCardList,
    chartCardList,
    fetchPrometheusFunc,
  } = props;

  const ctx = useContext(BaseContentContext);

  function renderTopCards() {
    return (
      <Row gutter={[16, 16]}>
        {topCardList.map((chartProps) => {
          if (chartProps.hidden) {
            return null;
          }
          const config = merge({}, baseTopCardProps, chartProps);
          const { span, fetchDataParams = {}, ...rest } = config;
          const colProps = {
            key: rest.title,
          };
          if (!span) {
            colProps.flex = 1;
          } else {
            colProps.span = span;
          }

          const { params = {} } = fetchDataParams;

          const newFetchDataParams = {
            currentRange: ctx.range,
            interval: ctx.interval,
            params,
          };
          if (ctx.node?.metric.hostname) {
            newFetchDataParams.params.hostname = ctx.node?.metric.hostname;
          } else if (ctx.node?.metric.instance) {
            newFetchDataParams.params.instance = ctx.node?.metric.instance;
          }
          return (
            <Col {...colProps}>
              <BaseCard
                {...rest}
                fetchDataParams={newFetchDataParams}
                fetchPrometheusFunc={fetchPrometheusFunc}
              />
            </Col>
          );
        })}
      </Row>
    );
  }

  function renderChartCards() {
    return (
      <Row gutter={[16, 16]}>
        {chartCardList.map((chartProps) => {
          const config = merge({}, baseChartProps, chartProps);
          const { span, fetchDataParams = {}, ...rest } = config;
          const colProps = {
            key: rest.title,
          };
          if (!span) {
            colProps.flex = 1;
          } else {
            colProps.span = span;
          }

          const { params = {} } = fetchDataParams;

          const newFetchDataParams = {
            currentRange: ctx.range,
            interval: ctx.interval,
            params,
          };
          if (ctx.node?.metric.hostname) {
            newFetchDataParams.params.hostname = ctx.node?.metric.hostname;
          } else if (ctx.node?.metric.instance) {
            newFetchDataParams.params.instance = ctx.node?.metric.instance;
          }
          return (
            <Col {...colProps}>
              <ChartCard
                {...rest}
                fetchDataParams={newFetchDataParams}
                fetchPrometheusFunc={fetchPrometheusFunc}
              />
            </Col>
          );
        })}
      </Row>
    );
  }

  return (
    <Row gutter={[16, 16]}>
      {topCardList.length !== 0 && <Col span={24}>{renderTopCards()}</Col>}
      {chartCardList.length !== 0 && <Col span={24}> {renderChartCards()}</Col>}
    </Row>
  );
};

Charts.defaultProps = {
  baseTopCardProps: {
    createFetchParams: {
      requestType: 'current',
    },
    handleDataParams: {
      formatDataFn: handleResponses,
    },
    renderContent: ({ data }) => (
      <div className={styles['top-content']}>{get(data, '[0].y', 0)}</div>
    ),
  },
  baseChartProps: {
    span: 12,
    createFetchParams: {
      requestType: 'range',
    },
    handleDataParams: {
      formatDataFn: handleResponses,
    },
    chartProps: {
      height: 300,
      scale: {
        y: {
          nice: true,
        },
      },
    },
  },
  topCardList: [],
  chartCardList: [],
};

export default Charts;
