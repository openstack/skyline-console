import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import globalInstanceLogStore from 'src/stores/nova/instance';
import { Button, Col, Form, InputNumber, Row, Skeleton } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import classnames from 'classnames';
import styles from 'src/components/Tables/Base/index.less';

export default function Log({ detail }) {
  const [logs, setLogs] = useState('');
  const [loading, setLoading] = useState(true);

  const getLogs = async (tailSize) => {
    setLoading(true);
    const data = await globalInstanceLogStore.fetchLogs(detail.id, tailSize);
    setLogs(data.output);
    setLoading(false);
  };

  useEffect(() => {
    getLogs(35);
  }, [detail.id]);

  function onFinish(value) {
    getLogs(value.number);
  }

  const renderLogs = () => {
    if (loading) {
      return <Skeleton active />;
    }

    if (logs) {
      return <pre>{logs}</pre>;
    }

    return t('No Logs...');
  };

  return (
    <div>
      <Form initialValues={{ number: 35 }} onFinish={onFinish}>
        <Row gutter={16}>
          <Col span={16}>
            <h2 style={{ paddingLeft: 16 }}>{t('Instance Console Log')}</h2>
          </Col>

          <Col span={4}>
            <Form.Item name="number" label={t('Log Length')}>
              <InputNumber
                min={1}
                max={100000}
                placeholder={t('Log Length')}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>

          <Col span={4}>
            <div className={classnames(styles['table-header-btns'])}>
              <Button type="primary" htmlType="submit">
                <SearchOutlined />
              </Button>

              <a
                href={`/instances/${detail.id}/logs`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button type="primary">{t('View Full Log')}</Button>
              </a>
            </div>
          </Col>
        </Row>
      </Form>

      <div
        style={{
          margin: '16px',
          padding: 16,
          backgroundColor: '#90a4ae',
          borderRadius: 4,
          color: '#fff',
          fontSize: 12,
        }}
      >
        {renderLogs()}
      </div>
    </div>
  );
}

Log.propTypes = {
  detail: PropTypes.shape({
    id: PropTypes.string.isRequired,
  }).isRequired,
};
