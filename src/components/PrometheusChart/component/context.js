import { createContext } from 'react';
import { defaultOneHourAgo } from '../utils/utils';

const BaseContentContext = createContext({
  interval: 10,
  range: defaultOneHourAgo(),
  node: {
    metric: {
      hostname: '',
    },
  },
});

export default BaseContentContext;
