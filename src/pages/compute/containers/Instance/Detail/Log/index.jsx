import React, { useEffect, useState } from 'react';
import globalInstanceLogStore from 'src/stores/nova/instance';
import { Button, Col, Form, InputNumber, Row, Skeleton } from 'antd';
import { SearchOutlined, SettingOutlined } from '@ant-design/icons';
import classnames from 'classnames';
import styles from 'src/components/Tables/Base/index.less';

export default function Log(props) {
  const [logs, setLogs] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLogs(35);
  }, []);

  const getLogs = async (tailSize) => {
    setLoading(true);
    const data = await globalInstanceLogStore.fetchLogs(
      props.detail.id,
      tailSize
    );
    setLogs(data.output);
    setLoading(false);
  };

  function onFinish(value) {
    getLogs(value.number);
  }

  async function viewFullLog() {
    setLoading(true);
    const data = await globalInstanceLogStore.fetchLogs(props.detail.id, null);
    const newWindow = window.open('console', '_blank');
    const title = t('Console Log');
    const htmlContent = `
      <html>
        <head>
          <title>${title}</title>
        </head>
        <body>
          <pre>${data.output}</pre>
        </body>
      </html>`;
    newWindow.document.write(htmlContent);
    newWindow.document.close();
    setLoading(false);
  }

  return (
    <div>
      <Form initialValues={{ number: 35 }} onFinish={onFinish}>
        <Row gutter={16}>
          <Col className="gutter-row" span={16}>
            <h2 style={{ paddingLeft: 16 }}>{t('Instance Console Log')}</h2>
          </Col>
          <Col className="gutter-row" span={4}>
            <Form.Item name="number" label={t('Log Length')}>
              <InputNumber
                min={1}
                max={100000}
                placeholder={t('Log Length')}
                style={{ width: '100%' }}
                addonafter={<SettingOutlined />}
              />
            </Form.Item>
          </Col>
          <Col className="gutter-row" span={4}>
            <div className={classnames(styles['table-header-btns'])}>
              <Button type="primary" htmlType="submit">
                <SearchOutlined />
              </Button>

              <Button type="primary" onClick={() => viewFullLog()}>
                {t('View Full Log')}
              </Button>
            </div>
          </Col>
        </Row>
      </Form>

      <div
        style={{
          margin: 'auto 16px 16px 16px',
          padding: 16,
          backgroundColor: '#90a4ae',
          borderRadius: 4,
          color: '#fff',
          fontSize: 12,
        }}
      >
        {loading ? (
          <Skeleton loading={loading} active />
        ) : logs ? (
          <pre>{logs}</pre>
        ) : (
          t('No Logs...')
        )}
      </div>
    </div>
  );
}
