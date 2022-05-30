import React from 'react';
import { Skeleton } from 'antd';
import {
  Chart,
  Interval,
  Coordinate,
  Legend,
  View,
  Annotation,
} from 'bizcharts';

function Ring(props) {
  const { used = 0, add = 1, reserved = 0, limit = 1 } = props;
  const left = limit - used - reserved - add;
  const data = [
    {
      type: t('Used'),
      value: used,
      color: '#5B8FF9',
    },
  ];
  if (reserved) {
    data.push({
      type: t('Reserved'),
      value: reserved,
      color: '#5D7092',
    });
  }
  data.push({
    type: t('New'),
    value: add,
    color: '#5AD8A6',
  });
  data.push({
    type: t('Left'),
    value: left,
    color: '#eee',
  });
  const colors = data.map((it) => it.color);
  return (
    <div style={{ width: '120px' }}>
      <Chart placeholder={false} height={120} padding="auto" autoFit>
        <Legend visible={false} />
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
            position={['50%', '40%']}
            content={t('Quota')}
            style={{
              lineHeight: '240px',
              fontSize: '16',
              fill: '#000',
              textAlign: 'center',
            }}
          />
          <Annotation.Text
            position={['50%', '62%']}
            content={limit}
            style={{
              lineHeight: '240px',
              fontSize: '24',
              fill: colors[0],
              textAlign: 'center',
            }}
          />
        </View>
      </Chart>
    </div>
  );
}

function QuotaInfo(props) {
  const { used = 0, reserved = 0, add = 1 } = props;
  return (
    <div>
      <p>
        <b>{t('Quota')}:</b> {t('Unlimit')}
      </p>
      <p>
        <b>{t('Used')}:</b>: {used}
      </p>
      {!!reserved && (
        <p>
          <b>{t('Reserved')}:</b>: {reserved}
        </p>
      )}
      <p>
        <b>{t('New')}:</b>: {add}
      </p>
    </div>
  );
}

export default function QuotaChart(props) {
  const { limit = 0, loading } = props;
  if (loading) {
    return <Skeleton />;
  }
  if (limit === -1) {
    return <QuotaInfo {...props} />;
  }

  return (
    <div>
      <Ring {...props} />
    </div>
  );
}
