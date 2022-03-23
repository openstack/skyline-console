import { inject, observer } from 'mobx-react';
import Base from 'components/Form';
import globalNetworkStore from 'stores/neutron/network';

@inject('rootStore')
@observer
export default class StepNetworking extends Base {

  init() {
    this.getNetworkStore();
    this.selectedNetwork = [];
  }
  get title() {
    return t('Networking *');
  }

  get name() {
    return 'Networking';
  }
  get networking() {
    return (globalNetworkStore.list.data || []).map((it) => ({
      label: it.name,
      value: it.id
    }));
  }

  allowed = () => Promise.resolve();

  async getNetworkStore() {
    await globalNetworkStore.fetchList();
  }

  onChangeNetworkGroup = (checkedValues) => {
    this.selectedNetwork = checkedValues;
  }

  get defaultValue() {
    const values = {
      project: this.currentProjectName
    };
    return values;
  }

  get formItems() {
    return [
      {
        name: 'project',
        label: t('Project'),
        type: 'label',
      },
      {
        type: 'divider',
      },
      {
        name: 'network',
        label: t('Options'),
        type: 'network-select-table',
        options: this.networking,
      },
    ];
  }
}
