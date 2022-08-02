import { observer, inject } from 'mobx-react';
import Base from 'containers/List';
import globalActionLogStore from 'stores/nova/action-log';
import { actionColumn } from 'resources/nova/instance';

export class ActionLog extends Base {
  init() {
    this.store = globalActionLogStore;
  }

  get name() {
    return t('Action Logs');
  }

  get rowKey() {
    return 'request_id';
  }

  get policy() {
    return 'os_compute_api:os-instance-actions:list';
  }

  getColumns = () => actionColumn(this);

  get hideSearch() {
    return true;
  }
}

export default inject('rootStore')(observer(ActionLog));
