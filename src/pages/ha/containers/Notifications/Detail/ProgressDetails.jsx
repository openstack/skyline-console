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
import BaseTable from 'components/Tables/Base';
import { inject, observer } from 'mobx-react';
import { getLocalTimeStr } from 'src/utils/time';
import globalNotificationStore, {
  NotificationStore,
} from 'stores/masakari/notifications';
import styles from './index.less';

export class ProgressDetails extends React.Component {
  store = globalNotificationStore;

  downloadStore = new NotificationStore();

  getIsLoading() {
    return !this.store.detail?.recovery_workflow_details;
  }

  getRows() {
    if (this.getIsLoading()) return [];

    const recoveryWorkflowDetails = this.store.detail.recovery_workflow_details;

    return recoveryWorkflowDetails
      .map((detailItem, detailItemIndex) => {
        return detailItem.progress_details.map(
          (progressDetail, progressDetailIndex) => ({
            id: `${detailItemIndex}-${progressDetailIndex}`,
            action: detailItem.name,
            timestamp: getLocalTimeStr(progressDetail.timestamp),
            message: progressDetail.message,
          })
        );
      })
      .flat();
  }

  getColumns() {
    return [
      {
        title: t('Action'),
        dataIndex: 'action',
        sortKey: 'action',
      },
      {
        title: t('Timestamp'),
        dataIndex: 'timestamp',
        sortKey: 'timestamp',
      },
      {
        title: t('Message'),
        dataIndex: 'message',
        sortKey: 'message',
      },
    ];
  }

  createPagination(rowLength) {
    return {
      total: rowLength,
      current: 1,
      pageSize: rowLength,
      showTotal: (total) => t('Total {total} items', { total }),
      showSizeChanger: false,
    };
  }

  render() {
    const rows = this.getRows();
    return (
      <div className={styles.wrapper}>
        <BaseTable
          data={rows}
          columns={this.getColumns()}
          isLoading={this.getIsLoading()}
          pagination={this.createPagination(rows.length)}
          rowKey="id"
          hideHeader
          emptyText="No progress details"
          resourceName="notification-progress-details"
          searchFilters={[]}
          hideDownload
        />
      </div>
    );
  }
}

export default inject('rootStore')(observer(ProgressDetails));
