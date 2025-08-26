import CreateAction from './Create';
import DeleteAction from './Delete';

const actionConfigs = {
  rowActions: {
    firstAction: DeleteAction,
    moreActions: [],
  },
  batchActions: [DeleteAction],
  primaryActions: [CreateAction],
};

export default actionConfigs;
