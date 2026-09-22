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
import { observer, inject } from 'mobx-react';
import {
  Button,
  Modal,
  Form,
  InputNumber,
  Table,
  Tag,
  Alert,
  Typography,
  Space,
  Divider,
  Popconfirm,
} from 'antd';
import globalClaimStore from 'stores/zaqar/claim';

const { Text } = Typography;

export class ClaimPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      creating: false,
      releasing: false,
      modalVisible: false,
      error: null,
    };
    this.formRef = React.createRef();
  }

  componentDidMount() {
    // Clear claim data only if we're on a different queue than the last claim
    const lastQueue = globalClaimStore.lastClaimQueue;
    if (lastQueue && lastQueue !== this.queueName) {
      globalClaimStore.clearClaimed();
    }
  }

  get queueName() {
    const { match } = this.props;
    return match && match.params && match.params.id;
  }

  get columns() {
    return [
      {
        title: t('Message ID'),
        dataIndex: 'id',
        width: 220,
        render: (value) => (
          <Text
            ellipsis={{ tooltip: value }}
            style={{ fontFamily: 'monospace', maxWidth: 200 }}
          >
            {value || '-'}
          </Text>
        ),
      },
      {
        title: t('Body'),
        dataIndex: 'body',
        width: 280,
        render: this.renderBody,
      },
      {
        title: t('TTL (s)'),
        dataIndex: 'ttl',
        width: 90,
        render: (v) => (v !== undefined ? v : '-'),
      },
      {
        title: t('Age (s)'),
        dataIndex: 'age',
        width: 90,
        render: (v) => (v !== undefined ? v : '-'),
      },
      {
        title: t('Claim ID'),
        dataIndex: 'claim_id',
        width: 220,
        render: (v) => (
          <Text
            ellipsis={{ tooltip: v }}
            style={{ fontFamily: 'monospace', maxWidth: 200 }}
          >
            {v || '-'}
          </Text>
        ),
      },
    ];
  }

  openCreateModal = () => {
    this.setState({ modalVisible: true, error: null });
  };

  closeCreateModal = () => {
    this.setState({ modalVisible: false });
    if (this.formRef.current) {
      this.formRef.current.resetFields();
    }
  };

  handleCreateSubmit = async () => {
    try {
      await this.formRef.current.validateFields();
    } catch {
      return;
    }
    // Read directly from form fields to ensure InputNumber changes are captured
    const ttl = this.formRef.current.getFieldValue('ttl') || 300;
    const grace = this.formRef.current.getFieldValue('grace') || 60;
    const limit = this.formRef.current.getFieldValue('limit') || 1;
    this.setState({ creating: true, error: null });
    try {
      await globalClaimStore.createClaim(this.queueName, ttl, grace, limit);
      this.setState({
        creating: false,
        modalVisible: false,
      });
      if (this.formRef.current) {
        this.formRef.current.resetFields();
      }
    } catch (e) {
      this.setState({
        creating: false,
        error: e.message || t('Failed to create claim'),
      });
    }
  };

  handleReleaseClaim = async () => {
    const claimId = globalClaimStore.lastClaimId;
    if (!claimId) return;
    this.setState({ releasing: true, error: null });
    try {
      await globalClaimStore.releaseClaim(this.queueName, claimId);
      globalClaimStore.clearClaimed();
      this.setState({ releasing: false });
    } catch (e) {
      this.setState({
        releasing: false,
        error: e.message || t('Failed to release claim'),
      });
    }
  };

  handleClearResults = () => {
    this.setState({ error: null });
    globalClaimStore.clearClaimed();
  };

  renderBody = (body) => {
    if (body === null || body === undefined) return '-';
    const display =
      typeof body === 'object' ? JSON.stringify(body) : String(body);
    return (
      <Text ellipsis={{ tooltip: display }} style={{ maxWidth: 250 }}>
        {display}
      </Text>
    );
  };

  renderCreateModal() {
    const { modalVisible, creating } = this.state;
    return (
      <Modal
        title={t('Create Claim')}
        visible={modalVisible}
        onOk={this.handleCreateSubmit}
        confirmLoading={creating}
        onCancel={this.closeCreateModal}
        okText={t('Create')}
        cancelText={t('Cancel')}
        destroyOnClose
      >
        <Form
          ref={this.formRef}
          layout="vertical"
          initialValues={{ ttl: 300, grace: 60, limit: 1 }}
        >
          <Form.Item
            name="ttl"
            label={t('TTL (seconds)')}
            help={t('How long (in seconds) the claim will be valid.')}
          >
            <InputNumber min={60} max={43200} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="grace"
            label={t('Grace (seconds)')}
            help={t(
              'Extra seconds to allow consumers to ack after a claim expires.'
            )}
          >
            <InputNumber min={60} max={43200} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="limit"
            label={t('Limit')}
            help={t('Maximum number of messages to claim (1–20).')}
          >
            <InputNumber
              min={1}
              max={20}
              precision={0}
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Form>
      </Modal>
    );
  }

  render() {
    const { releasing, error } = this.state;
    const { claimedMessages } = globalClaimStore;
    const claimId = globalClaimStore.lastClaimId;

    return (
      <div style={{ padding: '16px' }}>
        <Space style={{ marginBottom: 16 }}>
          <Button type="primary" onClick={this.openCreateModal}>
            {t('Create Claim')}
          </Button>

          {claimId && (
            <Popconfirm
              title={t(
                'This will release the claim and make messages available again. Continue?'
              )}
              onConfirm={this.handleReleaseClaim}
              okText={t('Release')}
              cancelText={t('Cancel')}
              okButtonProps={{ danger: true }}
            >
              <Button danger loading={releasing}>
                {t('Release Claim')}
              </Button>
            </Popconfirm>
          )}

          {claimedMessages.length > 0 && (
            <Button onClick={this.handleClearResults}>
              {t('Clear Results')}
            </Button>
          )}
        </Space>

        {error && (
          <Alert
            type="error"
            message={error}
            style={{ marginBottom: 16 }}
            closable
            onClose={() => this.setState({ error: null })}
          />
        )}

        {claimId && (
          <Alert
            type="success"
            style={{ marginBottom: 16 }}
            message={
              <span>
                {t('Claim created successfully. Claim ID:')}{' '}
                <Text code copyable style={{ fontFamily: 'monospace' }}>
                  {claimId}
                </Text>
              </span>
            }
          />
        )}

        {claimedMessages.length > 0 ? (
          <>
            <Divider orientation="left">
              <Tag color="orange">
                {`${t('Claimed Messages')} (${claimedMessages.length})`}
              </Tag>
            </Divider>
            <Table
              rowKey="id"
              dataSource={claimedMessages}
              columns={this.columns}
              pagination={false}
              size="small"
              bordered
            />
          </>
        ) : (
          !claimId && (
            <Alert
              type="info"
              message={t(
                'Click "Create Claim" to claim messages from this queue. Claimed messages are temporarily locked for exclusive processing.'
              )}
            />
          )
        )}

        {this.renderCreateModal()}
      </div>
    );
  }
}

export default inject('rootStore')(observer(ClaimPanel));
