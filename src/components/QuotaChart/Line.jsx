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
import { Progress, Tooltip } from 'antd';
import { typeColors, getUsedValueColor } from './Ring';

export default function Line(props) {
  const {
    used = 0,
    add = 1,
    reserved = 0,
    limit = 1,
    title = '',
    secondTitle = t('Quota'),
  } = props;
  let left = limit - used - reserved - add;
  left = left < 0 ? 0 : left;
  const usedTip = `${t('Used')}: ${used}`;
  const reservedTip = reserved ? '' : `${t('Reserved')}: ${reserved}`;
  const newTip = `${t('New')}: ${add}`;
  const leftTip = `${t('Left')}: ${left}`;
  const tips = [usedTip, newTip, leftTip];
  if (reserved) {
    tips.splice(1, 0, reservedTip);
  }
  const tipTitle = tips.join(' / ');
  const allCount = used + reserved + add;
  const allPercent = parseInt((allCount / limit) * 100, 10);
  const usedPercent = parseInt(((used + reserved) / limit) * 100, 10);
  const usedColor = getUsedValueColor(allPercent);
  const resourceTitle = (
    <span>
      {`${title} ${secondTitle}: `}{' '}
      <span style={{ color: usedColor }}>{`${allCount}/${limit}`}</span>
    </span>
  );

  const progress = (
    <Progress
      percent={allPercent}
      success={{ percent: usedPercent, strokeColor: typeColors.used }}
      strokeColor={typeColors.add}
      showInfo={false}
    />
  );

  return (
    <div style={{ width: 150 }}>
      <div style={{ fontWeight: 'bold', textAlign: 'center' }}>
        {resourceTitle}
      </div>
      <Tooltip title={tipTitle}>{progress}</Tooltip>
    </div>
  );
}
