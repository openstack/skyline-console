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
} from 'bizcharts';

export const typeColors = {
  used: '#5B8FF9',
  reserved: '#5D7092',
  add: '#5AD8A6',
  left: '#eee',
  danger: '#E8684A',
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

export default function Ring(props) {
  const {
    used = 0,
    add = 1,
    reserved = 0,
    limit = 1,
    title = '',
    secondTitle = t('Quota'),
    hasLabel = false,
  } = props;
  const left = limit - used - reserved - add;
  const data = [
    {
      type: t('Used'),
      value: used,
      color: typeColors.used,
    },
  ];
  if (reserved) {
    data.push({
      type: t('Reserved'),
      value: reserved,
      color: typeColors.reserved,
    });
  }
  data.push({
    type: t('New'),
    value: add,
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
  const percent = (allCount / limit) * 100;

  return (
    <div style={style}>
      <Chart placeholder={false} height={height} padding="auto" autoFit>
        <Legend visible={hasLabel} />
        {/* 绘制图形 */}
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
              lineHeight: '240px',
              fontSize: '14',
              fill: '#000',
              textAlign: 'center',
            }}
          />
          <Annotation.Text
            position={['50%', '50%']}
            content={secondTitle}
            style={{
              lineHeight: '240px',
              fontSize: '14',
              fill: '#000',
              textAlign: 'center',
            }}
          />
          <Annotation.Text
            position={['50%', '70%']}
            content={`${allCount}/${limit}`}
            style={{
              lineHeight: '240px',
              fontSize: '14',
              fill: getUsedValueColor(percent),
              textAlign: 'center',
            }}
          />
        </View>
      </Chart>
    </div>
  );
}
