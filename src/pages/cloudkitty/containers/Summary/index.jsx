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
import { Card, Col, Row, Table, Progress, Spin, Empty } from 'antd';
import globalCloudKittySummaryStore from 'stores/cloudkitty/summary';
import { cloudkittyEndpoint } from 'client/client/constants';
import NotFound from 'components/Cards/NotFound';
import checkItemPolicy from 'resources/skyline/policy';
import Notify from 'components/Notify';
import { formatRate } from 'resources/cloudkitty/rating';
import styles from './index.less';

export class Summary extends Component {
  constructor(props) {
    super(props);
    this.store = globalCloudKittySummaryStore;
  }

  componentDidMount() {
    this.loadSummary();
  }

  componentDidUpdate() {
    if (this.requestedScope !== this.scopeKey) {
      this.loadSummary();
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
      actionName: t('rating summary'),
    });
  }

  get summary() {
    return this.store.summaryScope === this.scopeKey
      ? toJS(this.store.summary) || {}
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

  get breakdownColumns() {
    return [
      {
        title: t('Type'),
        dataIndex: 'type',
      },
      {
        title: t('Cost'),
        dataIndex: 'rate',
        render: (value) => formatRate(value),
      },
      {
        title: t('Percentage'),
        dataIndex: 'percentage',
        render: (value) => (
          <Progress percent={value} strokeWidth={6} style={{ width: 160 }} />
        ),
      },
    ];
  }

  get topResourcesColumns() {
    return [
      {
        title: t('Type'),
        dataIndex: 'type',
      },
      {
        title: t('Resource ID'),
        dataIndex: 'resource_id',
        render: (value) => value || '-',
      },
      {
        title: t('Cost'),
        dataIndex: 'rate',
        render: (value) => formatRate(value),
      },
    ];
  }

  loadSummary() {
    if (this.endpoint && this.allowed) {
      this.requestedScope = this.scopeKey;
      this.store
        .fetchSummary({
          scope: this.scope,
          projectId: this.projectId,
        })
        .catch(() =>
          Notify.error(t('Unable to load the rating summary. Please retry.'))
        );
    }
  }

  renderCard(title, value) {
    return (
      <Card className={styles.card}>
        <div className={styles['card-title']}>{title}</div>
        <div className={styles['card-value']}>{formatRate(value)}</div>
      </Card>
    );
  }

  render() {
    if (!this.endpoint) {
      return (
        <NotFound title={t('Rating')} link="/base/overview" endpointError />
      );
    }
    if (!this.allowed) {
      return <NotFound title={t('rating summary')} link="/base/overview" />;
    }
    const {
      currentMonthTotal = 0,
      lastMonthTotal = 0,
      forecastTotal = 0,
      breakdown = [],
      topResources = [],
      projectTotals = [],
      currentMonthName = '',
      lastMonthName = '',
    } = this.summary;

    return (
      <Spin spinning={this.store.isLoading}>
        <div className={styles.container}>
          <Row gutter={16} className={styles['card-row']}>
            <Col xs={24} sm={8}>
              {this.renderCard(
                t('Current Month ({name})', { name: currentMonthName }),
                currentMonthTotal
              )}
            </Col>
            <Col xs={24} sm={8}>
              {this.renderCard(t('Forecast Month End'), forecastTotal)}
            </Col>
            <Col xs={24} sm={8}>
              {this.renderCard(
                t('Last Month ({name})', { name: lastMonthName }),
                lastMonthTotal
              )}
            </Col>
          </Row>
          {this.scope === 'all' && (
            <Card
              title={t('Current Month Cost by Project')}
              className={styles.panel}
            >
              <Table
                rowKey="project_id"
                columns={this.projectColumns}
                dataSource={projectTotals}
                pagination={{ pageSize: 10 }}
              />
            </Card>
          )}
          <Row gutter={16}>
            <Col xs={24} lg={12}>
              <Card title={t('Cost Breakdown')} className={styles.panel}>
                {breakdown.length ? (
                  <Table
                    rowKey="type"
                    columns={this.breakdownColumns}
                    dataSource={breakdown}
                    pagination={false}
                  />
                ) : (
                  <Empty />
                )}
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title={t('Top Cost Generators')} className={styles.panel}>
                {topResources.length ? (
                  <Table
                    rowKey={(record) => `${record.type}-${record.resource_id}`}
                    columns={this.topResourcesColumns}
                    dataSource={topResources}
                    pagination={false}
                  />
                ) : (
                  <Empty />
                )}
              </Card>
            </Col>
          </Row>
        </div>
      </Spin>
    );
  }
}

export default inject('rootStore')(observer(Summary));
