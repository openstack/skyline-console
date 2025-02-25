import React, { useEffect, useState } from 'react';
import { Button, Form, InputNumber, Skeleton } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import SearchSvgIcon from 'asset/cube/monochrome/search.svg';
import CubeIconButton from 'components/cube/CubeButton/CubeIconButton';
import globalInstanceLogStore from 'src/stores/nova/instance';
import styles from './index.less';

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
    <div className={styles.wrapper}>
      <div className={styles['log-header']}>
        <p className={styles.title}>{t('Instance Console Log')}</p>
        <Form
          initialValues={{ number: 35 }}
          onFinish={onFinish}
          className={styles.form}
        >
          <Form.Item name="number" label={t('Log Length')}>
            <InputNumber
              min={1}
              max={100000}
              placeholder={t('Log Length')}
              addonafter={<SettingOutlined />}
            />
          </Form.Item>
          <CubeIconButton
            type="default"
            icon={SearchSvgIcon}
            htmlType="submit"
          />
          <Button type="primary" onClick={viewFullLog}>
            {t('View Full Log')}
          </Button>
        </Form>
      </div>

      <div className={styles['log-content']}>
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
