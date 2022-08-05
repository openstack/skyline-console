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

import React, { useEffect, useState } from 'react';
import globalContainersStore from 'stores/zun/containers';

export default function Logs(props) {
  const [logs, setLogs] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getLogs = async () => {
      setLoading(true);
      const cb = await globalContainersStore.fetchLogs(props.detail.uuid);
      setLogs(cb);
      setLoading(false);
    };
    getLogs();
  }, []);

  return (
    <div
      style={{
        margin: '0 16px 16px',
        padding: 16,
        backgroundColor: '#90a4ae',
        borderRadius: 4,
        color: '#fff',
        fontSize: 14,
      }}
    >
      {logs || loading ? <pre>{logs}</pre> : t('No Logs...')}
    </div>
  );
}
