import { observer, inject } from 'mobx-react';
import Base from 'containers/List';
import globalActionLogStore from 'stores/nova/action-log';
import { actionColumn } from 'resources/nova/instance';

@inject('rootStore')
@observer
export default class ActionLog extends Base {
  init() {
    this.store = globalActionLogStore;
  }

  get name() {
    return t('Action Log');
  }

  get rowKey() {
    return 'request_id';
  }

  getColumns = () => actionColumn(this);

  get hideSearch() {
    return true;
  }
}
