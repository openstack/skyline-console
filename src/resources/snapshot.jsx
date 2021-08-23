import React from 'react';

export const revertTip = (
  <span>
    <span style={{ fontWeight: 600 }}>
      {t(
        'When you restore a snapshot, one of the following conditions must be met:'
      )}
    </span>
    <p style={{ paddingLeft: 20 }} className="tip">
      {t('1. The cloud disk associated with the snapshot is available.')}
    </p>
    <p style={{ paddingLeft: 20 }} className="tip">
      {t(
        '2. The cloud hard disk associated with the snapshot has been mounted, and the cloud host is shut down.'
      )}
    </p>
  </span>
);
