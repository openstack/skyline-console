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

import {
  Annotation,
  Axis,
  Chart,
  Coordinate,
  Interaction,
  Interval,
  Legend,
  registerShape,
  Tooltip,
} from 'bizcharts';
import React from 'react';
import PropTypes from 'prop-types';

export default class CircleChart extends React.Component {
  static propTypes = {
    data: PropTypes.array,
    legendFontSize: PropTypes.number,
    legendOffsetX: PropTypes.number,
    middleFontSize: PropTypes.number,
  };

  static defaultProps = {
    legendFontSize: 16,
    legendOffsetX: -40,
    middleFontSize: 30,
  };

  render() {
    const { data, legendFontSize, legendOffsetX, middleFontSize } = this.props;
    const sliceNumber = 0.01; // Customize Other's graph by adding two lines

    registerShape('interval', 'sliceShape', {
      draw(cfg, container) {
        const { points } = cfg;
        let path = [];
        path.push(['M', points[0].x, points[0].y]);
        path.push(['L', points[1].x, points[1].y - sliceNumber]);
        path.push(['L', points[2].x, points[2].y - sliceNumber]);
        path.push(['L', points[3].x, points[3].y]);
        path.push('Z');
        // eslint-disable-next-line react/no-this-in-sfc
        path = this.parsePath(path);
        return container.addShape('path', {
          attrs: {
            fill: cfg.color,
            path,
          },
        });
      },
    });
    return (
      <Chart data={data} autoFit padding="auto" appendPadding={[0, 20, 0, 0]}>
        <Coordinate type="theta" radius={0.8} innerRadius={0.75} />
        <Axis visible={false} />
        <Tooltip showTitle={false} />
        <Interval
          adjust="stack"
          position="value"
          color="type"
          shape="sliceShape"
        />
        <Annotation.Text
          position={['50%', '50%']}
          content={data.reduce((a, b) => a + b.value, 0)}
          style={{
            lineHeight: 240,
            fontSize: middleFontSize,
            fill: '#262626',
            textAlign: 'center',
          }}
        />
        <Legend
          position="right"
          offsetX={legendOffsetX}
          itemName={{
            style: {
              fontSize: legendFontSize,
            },
          }}
        />
        <Interaction type="element-single-selected" />
      </Chart>
    );
  }
}
