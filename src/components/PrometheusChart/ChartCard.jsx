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

import { Chart, Line, Tooltip } from 'bizcharts';
import BaseCard from 'components/PrometheusChart/BaseCard';
import React from 'react';
import { ChartType, getXScale } from 'components/PrometheusChart/utils/utils';
import {
  baseLineProps,
  baseToolTipProps,
  multilineProps,
} from 'components/PrometheusChart/utils/baseProps';
import { toJS } from 'mobx';
import { observer } from 'mobx-react';

import { merge } from 'lodash';
import ArrowsAltOutlined from '@ant-design/icons/lib/icons/ArrowsAltOutlined';
import { Button, Modal } from 'antd';
import BaseContent from 'components/PrometheusChart/component/BaseContent';

const ChartCard = (props) => {
  const {
    constructorParams,
    params,
    currentRange,
    interval,
    chartProps,
    title,
    extra,
    isModal = false,
    BaseContentConfig = {},
  } = props;

  const {
    height,
    scale,
    chartType,
    toolTipProps = baseToolTipProps,
  } = chartProps;

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

  const renderContent = (store) => {
    let data = toJS(store.data);
    if (store.device) {
      data = data.filter((d) => d.device === store.device);
    }
    scale.x = merge({}, getXScale(props.currentRange), scale.x || {});
    return (
      <Chart autoFit padding="auto" data={data} height={height} scale={scale}>
        <Line {...lineProps} />
        <Tooltip {...toolTipProps} />
      </Chart>
    );
  };

  const ModalContent = observer(() => (
    <div style={{ height: 520 }}>
      <BaseContent
        renderChartCards={(store) => (
          <ChartCard
            {...props}
            currentRange={store.currentRange}
            interval={store.interval}
            isModal
          />
        )}
        {...BaseContentConfig}
        renderNodeSelect={false}
      />
    </div>
  ));

  return (
    <BaseCard
      constructorParams={constructorParams}
      params={params}
      currentRange={currentRange}
      interval={interval}
      title={title}
      extra={(s) => (
        <>
          {extra && extra(s)}
          {!isModal && (
            <Button
              type="text"
              icon={<ArrowsAltOutlined />}
              onClick={() => {
                Modal.info({
                  icon: null,
                  content: <ModalContent />,
                  width: 1200,
                  okText: t('OK'),
                });
              }}
            />
          )}
        </>
      )}
      renderContent={renderContent}
      visibleHeight={height}
    />
  );
};

export default observer(ChartCard);
