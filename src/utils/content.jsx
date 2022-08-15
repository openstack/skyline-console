import React from 'react';
import { isEmpty } from 'lodash';

export const stringifyContent = (value) =>
  isEmpty(value) ? (
    '-'
  ) : (
    <div>
      <pre>{JSON.stringify(value, null, 4)}</pre>
    </div>
  );
