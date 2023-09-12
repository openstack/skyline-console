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

import React from 'react';
import { observer, inject } from 'mobx-react';
import { PortStore } from 'stores/neutron/port-extension';
import { Button, Table, Collapse, Divider, Col, Row, Spin, Empty } from 'antd';
import ManageSecurityGroup from 'pages/network/containers/Port/actions/ManageSecurityGroup';
import { Link } from 'react-router-dom';
import classnames from 'classnames';
import { toJS } from 'mobx';
import { CaretRightOutlined } from '@ant-design/icons';
import PrimaryActionButtons from 'components/Tables/Base/PrimaryActionButtons';
import ItemActionButtons from 'components/Tables/Base/ItemActionButtons';
import { getSelfColumns } from 'resources/neutron/security-group-rule';
import { isAdminPage } from 'utils/index';
import { getPath } from 'utils/route-map';
import Detach from './actions/Detach';
import styles from './index.less';

const { Panel } = Collapse;

export class SecurityGroup extends React.Component {
  constructor(props) {
    super(props);
    this.store = new PortStore();
  }

  componentDidMount() {
    this.refreshSecurityGroup();
  }

  getDetailUrl(id) {
    const key = this.isAdminPage
      ? 'securityGroupDetailAdmin'
      : 'securityGroupDetail';
    return getPath({ key, params: { id } });
  }

  get portId() {
    const {
      detail: { id },
    } = this.props;
    return id;
  }

  get isAdminPage() {
    const { pathname } = this.props.location;
    return isAdminPage(pathname);
  }

  refreshSecurityGroup = () => {
    this.store.fetchSecurityGroupsDetail(this.portId);
  };

  renderPanelTitle(item) {
    const {
      security_groups: { data },
    } = this.store;
    const detailUrl = this.getDetailUrl(item.id);
    return (
      <Row>
        <Col span={18}>
          <span>{t('Security Group')}</span>
          <Divider type="vertical" className={styles['header-divider']} />
          <Button type="link">{item.name}</Button>
        </Col>
        <Col span={6}>
          {!this.isAdminPage && (
            <>
              <Link style={{ fontSize: 12, marginRight: 16 }} to={detailUrl}>
                {t('Edit Rule')}
              </Link>
            </>
          )}
          {!this.isAdminPage && data.length !== 1 && (
            <>
              <ItemActionButtons
                actions={{ firstAction: Detach }}
                onFinishAction={this.refreshSecurityGroup}
                item={item}
                containerProps={this.props}
              >
                {t('Detach')}
              </ItemActionButtons>
            </>
          )}
        </Col>
      </Row>
    );
  }

  renderPanel(item, index) {
    return (
      <Panel
        header={this.renderPanelTitle(item, index)}
        key={index}
        className={styles.panel}
      >
        <Table
          size="middle"
          pagination={false}
          bordered={false}
          rowKey="id"
          {...this.state}
          columns={getSelfColumns(this)}
          dataSource={
            item.security_group_rules ? toJS(item.security_group_rules) : null
          }
        />
      </Panel>
    );
  }

  render() {
    const { security_groups } = this.store;
    return (
      <div className={classnames(styles.wrapper, this.className)}>
        {this.isAdminPage ? null : (
          <div style={{ marginBottom: 20 }}>
            <PrimaryActionButtons
              containerProps={this.props}
              primaryActions={[ManageSecurityGroup]}
              onFinishAction={this.refreshSecurityGroup}
            />
          </div>
        )}
        <Spin spinning={security_groups.isLoading}>
          {security_groups.data && security_groups.data.length !== 0 ? (
            <Collapse
              className={styles.collapse}
              accordion
              bordered={false}
              expandIcon={({ isActive }) => (
                <CaretRightOutlined rotate={isActive ? 90 : 0} />
              )}
            >
              {security_groups.data.map((item, index) =>
                this.renderPanel(item, index)
              )}
            </Collapse>
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              style={{ backgroundColor: 'white', padding: '32px 0' }}
            />
          )}
        </Spin>
      </div>
    );
  }
}

export default inject('rootStore')(observer(SecurityGroup));
