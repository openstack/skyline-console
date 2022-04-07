
import Create from './Create';
import Delete from './Delete';

const actionConfigs = {
  rowActions: {
    firstAction: Delete,
  },
  batchActions: [Delete],
  primaryActions: [Create]
};

export default { actionConfigs };
