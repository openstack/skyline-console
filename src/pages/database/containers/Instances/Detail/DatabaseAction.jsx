import DeleteDatabase from './DatabaseDelete';

const actionConfigs = {
  rowActions: {
    firstAction: DeleteDatabase,
  },
  batchActions: [DeleteDatabase],
  primaryActions: []
};

export default actionConfigs;
