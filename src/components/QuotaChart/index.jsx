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
import { Skeleton } from 'antd';
import Ring from './Ring';
import Line from './Line';
import QuotaInfo from './Info';

function renderItem(props) {
  const { type = 'ring', limit, unlimitByTable = false } = props;
  if (limit === -1 && unlimitByTable) {
    return <QuotaInfo {...props} />;
  }
  if (type === 'ring') {
    return <Ring {...props} />;
  }
  if (type === 'line') {
    return <Line {...props} />;
  }
}

export default function QuotaChart(props) {
  const { quotas = [], loading } = props;
  if (loading) {
    return <Skeleton />;
  }
  const items = quotas.map((it, index) => {
    const { name } = it;
    const style = index === quotas.length - 1 ? {} : { marginBottom: 10 };
    return (
      <div key={name} style={style}>
        {renderItem(it)}
      </div>
    );
  });

  const style = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    overflowY: 'auto',
    overflowX: 'hidden',
    maxHeight: 400,
  };
  return <div style={style}>{items}</div>;
}
