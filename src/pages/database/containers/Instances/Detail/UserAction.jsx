import DeleteUser from './UserDelete';

const actionConfigs = {
  rowActions: {
    firstAction: DeleteUser,
  },
  batchActions: [DeleteUser],
  primaryActions: []
};

export default actionConfigs;
