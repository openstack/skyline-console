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

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Card, Col, Row } from 'antd';
import { Chart, Legend, Line, Tooltip } from 'bizcharts';
import { inject, observer } from 'mobx-react';
import styles from '../style.less';

@inject('rootStore')
@observer
class ResourceStatistic extends Component {
  componentDidMount() {
    const { user } = this.props.rootStore || {};
    const { project: { id: project_id } = {} } = user || {};
    this.props.store.getResourceStatisticData(project_id);
  }

  render() {
    const { resourceStatisticLoading } = this.props.store;
    const { chartArray } = this.props;

    return (
      <Card
        loading={resourceStatisticLoading}
        className={styles.top}
        bodyStyle={{ padding: 0 }}
        title={t('Resource Statistic (Last 15 Days)')}
        bordered={false}
      >
        <Row>
          {Object.keys(chartArray).map((item, index) => (
            <Col span={12} key={item}>
              {index % 6 === 1 ? (
                <div style={{ paddingTop: '20px' }}>
                  <Chart
                    scale={{ temperature: { min: 0 } }}
                    padding={[50, 20, 40, 20]}
                    autoFit
                    height={198}
                    data={data2}
                  >
                    <Line position="month*temperature" color="city" />
                    <Tooltip shared showCrosshairs />
                    <Legend
                      itemName={{
                        style: {
                          fill: '#333',
                        },
                      }}
                      position="top-left"
                      layout="vertical"
                    />
                  </Chart>
                </div>
              ) : (
                <div style={{ paddingTop: '20px', position: 'relative' }}>
                  <h2 style={{ position: 'absolute', left: '20px' }}>
                    {chartArray[item]}
                  </h2>
                  <Chart
                    scale={{ temperature: { min: 0 } }}
                    padding={[50, 20, 40, 50]}
                    autoFit
                    height={198}
                    data={data1}
                  >
                    <Line shape="smooth" position="year*value" />
                    <Tooltip showCrosshairs />
                  </Chart>
                </div>
              )}
            </Col>
          ))}
        </Row>
      </Card>
    );
  }
}

// 数据源
const data1 = [
  { year: '1991', value: 3 },
  { year: '1992', value: 4 },
  { year: '1993', value: 3.5 },
  { year: '1994', value: 5 },
  { year: '1995', value: 4.9 },
  { year: '1996', value: 6 },
  { year: '1997', value: 7 },
  { year: '1998', value: 9 },
  { year: '1999', value: 13 },
];

const data2 = [
  {
    month: 'Jan',
    city: 'Total Mem',
    temperature: 7,
  },
  {
    month: 'Jan',
    city: 'Total CPU',
    temperature: 3.9,
  },
  {
    month: 'Feb',
    city: 'Total Mem',
    temperature: 6.9,
  },
  {
    month: 'Feb',
    city: 'Total CPU',
    temperature: 4.2,
  },
  {
    month: 'Mar',
    city: 'Total Mem',
    temperature: 9.5,
  },
  {
    month: 'Mar',
    city: 'Total CPU',
    temperature: 5.7,
  },
  {
    month: 'Apr',
    city: 'Total Mem',
    temperature: 14.5,
  },
  {
    month: 'Apr',
    city: 'Total CPU',
    temperature: 8.5,
  },
  {
    month: 'May',
    city: 'Total Mem',
    temperature: 18.4,
  },
  {
    month: 'May',
    city: 'Total CPU',
    temperature: 11.9,
  },
  {
    month: 'Jun',
    city: 'Total Mem',
    temperature: 21.5,
  },
  {
    month: 'Jun',
    city: 'Total CPU',
    temperature: 15.2,
  },
  {
    month: 'Jul',
    city: 'Total Mem',
    temperature: 25.2,
  },
  {
    month: 'Jul',
    city: 'Total CPU',
    temperature: 17,
  },
  {
    month: 'Aug',
    city: 'Total Mem',
    temperature: 26.5,
  },
  {
    month: 'Aug',
    city: 'Total CPU',
    temperature: 16.6,
  },
  {
    month: 'Sep',
    city: 'Total Mem',
    temperature: 23.3,
  },
  {
    month: 'Sep',
    city: 'Total CPU',
    temperature: 14.2,
  },
  {
    month: 'Oct',
    city: 'Total Mem',
    temperature: 18.3,
  },
  {
    month: 'Oct',
    city: 'Total CPU',
    temperature: 10.3,
  },
  {
    month: 'Nov',
    city: 'Total Mem',
    temperature: 13.9,
  },
  {
    month: 'Nov',
    city: 'Total CPU',
    temperature: 6.6,
  },
  {
    month: 'Dec',
    city: 'Total Mem',
    temperature: 9.6,
  },
  {
    month: 'Dec',
    city: 'Total CPU',
    temperature: 4.8,
  },
];

ResourceStatistic.propTypes = {
  chartArray: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
};

export default ResourceStatistic;
