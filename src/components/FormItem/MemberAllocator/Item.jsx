// Copyright 2021 99cloud
//
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

import React, { useState } from 'react';
import IPAddress from './IPAddress';

const Item = ({ onChange, value }) => {
  value = value || {
    ip_address: {
      ip: undefined,
      protocol_port: undefined,
      weight: 1,
      subnet_id: undefined,
    },
    canEdit: true,
  };
  const [ip_address, setIP] = useState(value.ip_address);
  // const [visible, setVisible] = useState(!!value.subnet || false);

  const triggerChange = (changedValue) => {
    const item = {
      ...value,
      ip_address,
      ...changedValue,
    };
    onChange && onChange(item);
  };

  const handleIPChange = (v) => {
    setIP(v);
    triggerChange({
      ip_address: v,
    });
  };

  return (
    <IPAddress
      onChange={handleIPChange}
      value={ip_address}
      disabled={!value.canEdit}
    />
  );
};

export default Item;
