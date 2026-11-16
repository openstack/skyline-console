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
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import {
  Alert,
  Button,
  Card,
  Col,
  DatePicker,
  Dropdown,
  Empty,
  Menu,
  Row,
  Spin,
  Table,
} from 'antd';
import {
  Chart,
  Interval,
  Line,
  Point,
  Tooltip,
  Legend,
  Axis,
  Coordinate,
} from 'bizcharts';
import moment from 'moment';
import FileSaver from 'file-saver';
import { DownloadOutlined } from '@ant-design/icons';
import Notify from 'components/Notify';
import {
  buildReportingCsv,
  reportingCsvFilename,
} from 'resources/cloudkitty/reporting-csv';
import globalCloudKittySummaryStore from 'stores/cloudkitty/summary';
import { cloudkittyEndpoint } from 'client/client/constants';
import NotFound from 'components/Cards/NotFound';
import checkItemPolicy from 'resources/skyline/policy';
import { formatRate } from 'resources/cloudkitty/rating';
import {
  getReportRange,
  isValidReportRange,
  reportDate,
  shiftReportRange,
} from 'resources/cloudkitty/reporting';
import styles from './index.less';

const { RangePicker } = DatePicker;

// Reporting tab for the Rating panel: a date-range cost report built on the
// /summary endpoint, showing cumulated cost per service type (pie + table) and
// a daily time-series breakdown (line chart).
export class Reporting extends Component {
  constructor(props) {
    super(props);
    this.store = globalCloudKittySummaryStore;
    this.state = {
      // Default to the current month, matching the dashboard's default range.
      range: getReportRange('month'),
      period: 'month',
      amount: 1,
      reportReady: false,
    };
  }

  componentDidMount() {
    this.loadReport();
  }

  componentDidUpdate() {
    if (this.requestedScope !== this.scopeKey) {
      this.loadReport();
    }
  }

  get scope() {
    return this.props.location?.pathname?.startsWith('/cloudkitty-admin/')
      ? 'all'
      : 'project';
  }

  get projectId() {
    return this.props.rootStore?.projectId || this.store.currentProjectId;
  }

  get scopeKey() {
    return this.scope === 'all' ? 'all' : `project:${this.projectId || ''}`;
  }

  get endpoint() {
    return cloudkittyEndpoint();
  }

  get policy() {
    return 'summary:get_summary';
  }

  get allowed() {
    return checkItemPolicy({
      policy: this.policy,
      actionName: t('rating report'),
    });
  }

  get report() {
    return this.store.reportScope === this.scopeKey
      ? toJS(this.store.report) || {}
      : {};
  }

  get projectColumns() {
    return [
      { title: t('Project ID'), dataIndex: 'project_id' },
      {
        title: t('Cost'),
        dataIndex: 'rate',
        sorter: (a, b) => a.rate - b.rate,
        defaultSortOrder: 'descend',
        render: (value) => formatRate(value),
      },
    ];
  }

  get repartitionColumns() {
    const { totalCost = 0 } = this.report;
    return [
      {
        title: t('Service Type'),
        dataIndex: 'type',
      },
      {
        title: t('Cost'),
        dataIndex: 'rate',
        render: (value) => formatRate(value),
      },
      {
        title: t('Percentage'),
        dataIndex: 'rate',
        key: 'percentage',
        render: (value) =>
          totalCost > 0
            ? `${(Math.round((value / totalCost) * 1000) / 10).toFixed(1)}%`
            : '-',
      },
    ];
  }

  onRangeChange = (range) => {
    this.setState({ range: range || [null, null], period: null });
  };

  onSelectPeriod = (period, amount = 1, previous = false) => {
    this.setState(
      { range: getReportRange(period, amount, previous), period, amount },
      this.fetchReport
    );
  };

  onNavigate = (direction) => {
    const { range, period, amount } = this.state;
    const nextRange =
      period && shiftReportRange(range, period, amount, direction);
    if (nextRange) {
      this.setState({ range: nextRange }, this.fetchReport);
    }
  };

  onApply = () => {
    this.fetchReport();
  };

  get canExport() {
    const { range, reportReady } = this.state;
    const { begin, end } = this.report;
    return (
      reportReady &&
      !this.store.isLoading &&
      isValidReportRange(range) &&
      begin === reportDate(range[0]).format('YYYY-MM-DD') &&
      end === reportDate(range[1]).format('YYYY-MM-DD')
    );
  }

  onExport = () => {
    if (!this.canExport) {
      return;
    }
    const { report } = this;
    const blob = new Blob([buildReportingCsv(report)], {
      type: 'text/csv;charset=utf-8',
    });
    FileSaver.saveAs(blob, reportingCsvFilename(report));
  };

  fetchReport = async () => {
    const { range } = this.state;
    if (!isValidReportRange(range)) {
      return;
    }
    const [start, end] = range.map(reportDate);
    this.setState({ reportReady: false });
    try {
      await this.store.fetchReport({
        begin: start.toDate(),
        end: end.toDate(),
        scope: this.scope,
        projectId: this.projectId,
      });
      this.setState({ reportReady: true });
    } catch (error) {
      Notify.error(
        t('Unable to load the complete rating report. Please retry.')
      );
    }
  };

  loadReport() {
    if (this.endpoint && this.allowed) {
      this.requestedScope = this.scopeKey;
      this.fetchReport();
    }
  }

  renderRangeMenu(previous = false) {
    const options = previous
      ? [
          ['day', 1, t('Yesterday')],
          ['week', 1, t('Last Week')],
          ['month', 1, t('Last Month')],
          ['month', 3, t('Last 3 Months')],
          ['month', 6, t('Last 6 Months')],
          ['year', 1, t('Last Year')],
        ]
      : [
          ['day', 1, t('Day View')],
          ['week', 1, t('Week View')],
          ['month', 1, t('Month View')],
          ['year', 1, t('Year View')],
        ];
    return (
      <Menu>
        {options.map(([period, amount, label]) => (
          <Menu.Item
            key={`${period}-${amount}`}
            onClick={() => this.onSelectPeriod(period, amount, previous)}
          >
            {label}
          </Menu.Item>
        ))}
      </Menu>
    );
  }

  renderPie() {
    const { repartition = [] } = this.report;
    if (!repartition.length) {
      return <Empty />;
    }
    return (
      <Chart
        height={320}
        data={repartition}
        autoFit
        scale={{ rate: { nice: true } }}
      >
        <Coordinate type="theta" radius={0.8} />
        <Tooltip showTitle={false} />
        <Legend position="right" />
        <Interval
          position="rate"
          adjust="stack"
          color="type"
          label={[
            'type',
            {
              content: (data) => `${data.type}: ${formatRate(data.rate)}`,
            },
          ]}
        />
      </Chart>
    );
  }

  renderTimeline() {
    const { series = [] } = this.report;
    if (!series.length) {
      return <Empty />;
    }
    return (
      <Chart
        height={320}
        data={series}
        autoFit
        scale={{
          date: { type: 'cat' },
          rate: { nice: true },
        }}
      >
        <Tooltip shared showCrosshairs />
        <Legend position="top" />
        <Axis name="rate" />
        <Line shape="smooth" position="date*rate" color="type" />
        <Point position="date*rate" color="type" size={3} shape="circle" />
      </Chart>
    );
  }

  render() {
    if (!this.endpoint) {
      return (
        <NotFound title={t('Rating')} link="/base/overview" endpointError />
      );
    }
    if (!this.allowed) {
      return <NotFound title={t('rating report')} link="/base/overview" />;
    }
    const { range, period, amount } = this.state;
    const validRange = isValidReportRange(range);
    const canNavigateNext =
      period && shiftReportRange(range, period, amount, 1);
    const { repartition = [], projectTotals = [], totalCost = 0 } = this.report;

    return (
      <Spin spinning={this.store.isLoading}>
        <div className={styles.container}>
          <Card className={styles.panel}>
            <Row gutter={[16, 12]} align="middle">
              <Col>
                <span className={styles.label}>{t('Period')}:</span>
              </Col>
              <Col>
                <RangePicker
                  disabled={this.store.isLoading}
                  allowClear={false}
                  format="YYYY-MM-DD"
                  value={range}
                  onChange={this.onRangeChange}
                  disabledDate={(current) =>
                    current && current > moment().endOf('day')
                  }
                />
              </Col>
              <Col>
                <Button
                  type="primary"
                  onClick={this.onApply}
                  disabled={!validRange || this.store.isLoading}
                >
                  {t('Apply')}
                </Button>
              </Col>
              <Col flex="auto" style={{ textAlign: 'right' }}>
                <span className={styles.label}>{t('Total')}:</span>{' '}
                <span className={styles.total}>{formatRate(totalCost)}</span>
              </Col>
            </Row>
            <Row gutter={[12, 12]} className={styles['range-controls']}>
              <Col>
                <Dropdown overlay={this.renderRangeMenu()} trigger={['click']}>
                  <Button disabled={this.store.isLoading}>
                    {t('Period Range')}
                  </Button>
                </Dropdown>
              </Col>
              <Col>
                <Dropdown
                  overlay={this.renderRangeMenu(true)}
                  trigger={['click']}
                >
                  <Button disabled={this.store.isLoading}>
                    {t('Preset Ranges')}
                  </Button>
                </Dropdown>
              </Col>
              <Col>
                <Button
                  onClick={() => this.onNavigate(-1)}
                  disabled={!period || !validRange || this.store.isLoading}
                >
                  {t('Previous')}
                </Button>
              </Col>
              <Col>
                <Button
                  onClick={() => this.onNavigate(1)}
                  disabled={
                    !canNavigateNext || !validRange || this.store.isLoading
                  }
                >
                  {t('Next')}
                </Button>
              </Col>
              <Col>
                <Button
                  icon={<DownloadOutlined />}
                  onClick={this.onExport}
                  disabled={!this.canExport}
                >
                  {t('Export CSV')}
                </Button>
              </Col>
            </Row>
            {!validRange && (
              <Alert
                className={styles['range-controls']}
                type="warning"
                showIcon
                message={t(
                  'Select a valid date range of up to 366 days ending today or earlier.'
                )}
              />
            )}
          </Card>

          <Row gutter={16}>
            <Col xs={24} lg={12}>
              <Card
                title={t('Cost Repartition by Service Type')}
                className={styles.panel}
              >
                {this.renderPie()}
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title={t('Daily Cost Breakdown')} className={styles.panel}>
                {this.renderTimeline()}
              </Card>
            </Col>
          </Row>

          <Card title={t('Cost by Service Type')} className={styles.panel}>
            {repartition.length ? (
              <Table
                rowKey="type"
                columns={this.repartitionColumns}
                dataSource={repartition}
                pagination={false}
              />
            ) : (
              <Empty />
            )}
          </Card>

          {this.scope === 'all' && (
            <Card title={t('Cost by Project')} className={styles.panel}>
              <Table
                rowKey="project_id"
                columns={this.projectColumns}
                dataSource={projectTotals}
                pagination={{ pageSize: 10 }}
              />
            </Card>
          )}
        </div>
      </Spin>
    );
  }
}

export default inject('rootStore')(observer(Reporting));
