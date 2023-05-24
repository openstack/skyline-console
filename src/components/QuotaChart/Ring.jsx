// Copyright 2022 99cloud
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
import {
  Chart,
  Interval,
  Coordinate,
  Legend,
  View,
  Annotation,
  Tooltip,
} from 'bizcharts';
import { Tooltip as AntTooltip } from 'antd';

export const typeColors = {
  used: globalCSS.primaryColor,
  reserved: '#5D7092',
  add: globalCSS.successColor,
  left: '#eee',
  danger: globalCSS.warnDarkColor,
};

export const getAddValueColor = (percent) => {
  if (percent > 80) {
    return typeColors.danger;
  }
  return typeColors.add;
};

export const getUsedValueColor = (percent) => {
  if (percent > 80) {
    return typeColors.danger;
  }
  return typeColors.used;
};

const testChinese = (str) => {
  const reg = /[\u4e00-\u9fa5]+/g;
  return str.match(reg);
};

export default function Ring(props) {
  const {
    used = 0,
    add = 0,
    reserved = 0,
    limit = 1,
    title = '',
    secondTitle = t('Quota'),
    hasLabel = false,
  } = props;
  const isLimit = limit !== -1;
  const showTip = isLimit;
  const limitNumber = !isLimit ? Infinity : limit;
  const limitStr = !isLimit ? t('Infinity') : limit;
  let left = !isLimit ? 1 : limit - used - reserved - add;
  if (left < 0) {
    left = 0;
  }
  const data = [
    {
      type: t('Used'),
      value: isLimit ? used : 0,
      color: typeColors.used,
    },
  ];
  if (reserved) {
    data.push({
      type: t('Reserved'),
      value: isLimit ? reserved : 0,
      color: typeColors.reserved,
    });
  }
  data.push({
    type: t('New'),
    value: isLimit ? add : 0,
    color: typeColors.add,
  });
  data.push({
    type: t('Left'),
    value: left,
    color: typeColors.left,
  });

  const colors = data.map((it) => it.color);

  const width = hasLabel ? 200 : 120;
  const style = { width };
  const height = width;
  const allCount = used + add + reserved;
  const percent = isLimit ? (allCount / limitNumber) * 100 : 0;

  let tipTitle = '';
  if (!isLimit) {
    const usedTip = `${t('Used')}: ${used}`;
    const reservedTip = reserved ? '' : `${t('Reserved')}: ${reserved}`;
    const newTip = `${t('New')}: ${add}`;
    const tips = [usedTip, newTip];
    if (reserved) {
      tips.splice(1, 0, reservedTip);
    }
    tipTitle = tips.join(' / ');
  }

  const titleLength = title.length;
  const titleFontSize = testChinese(title)
    ? titleLength > 6
      ? 10
      : 14
    : titleLength > 12
    ? 10
    : 14;

  const chart = (
    <Chart placeholder={false} height={height} padding="auto" autoFit>
      <Legend visible={showTip && hasLabel} />
      <Tooltip visible={showTip} />
      <View data={data}>
        <Coordinate type="theta" innerRadius={0.75} />
        <Interval
          position="value"
          adjust="stack"
          color={['type', colors]}
          size={16}
        />
        <Annotation.Text
          position={['50%', '30%']}
          content={title}
          style={{
            lineHeight: 1.5,
            fontSize: titleFontSize,
            fill: '#000',
            textAlign: 'center',
          }}
        />
        <Annotation.Text
          position={['50%', '50%']}
          content={secondTitle}
          style={{
            lineHeight: 1.5,
            fontSize: 14,
            fill: '#000',
            textAlign: 'center',
          }}
        />
        <Annotation.Text
          position={['50%', '70%']}
          content={`${allCount}/${limitStr}`}
          style={{
            lineHeight: 1.5,
            fontSize: 14,
            fill: getUsedValueColor(percent),
            textAlign: 'center',
            fontWeight: 'bold',
          }}
        />
      </View>
    </Chart>
  );

  const content = isLimit ? (
    chart
  ) : (
    <AntTooltip title={tipTitle}>{chart}</AntTooltip>
  );

  return <div style={style}>{content}</div>;
}
