import React, { useEffect, useState } from 'react';
import globalInstanceLogStore from 'src/stores/nova/instance';
import styles from './index.less';

const LogDetail = ({ match }) => {
  const id = match?.params?.id;

  const [logs, setLogs] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchLogs = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await globalInstanceLogStore.fetchLogs(id, null);

        if (cancelled) return;

        setLogs(typeof data?.output === 'string' ? data.output : '');
      } catch (err) {
        if (cancelled) return;

        console.error(err);
        setError(err?.message || t('Failed to load logs.'));
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchLogs();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className={styles['log-detail-container']}>
        <div className={styles['spinner-wrapper']}>
          <div className={styles.spinner} />
          <span>{t('Loading logs...')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles['log-detail-container']}>
      <div className={styles['log-content']}>
        {error ? (
          <span className={styles['error-message']}>
            {t('Error')}: {error}
          </span>
        ) : (
          <pre className={styles['log-output']}>
            {logs || t('No logs found.')}
          </pre>
        )}
      </div>
    </div>
  );
};

export default LogDetail;
