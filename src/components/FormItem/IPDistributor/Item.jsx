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
import { Col, Row, Select } from 'antd';
import IPAddress from 'components/FormItem/IPDistributor/IPAddress';

const Item = ({ subnetsAvailable, onChange, value }) => {
  value = value || {
    subnet: undefined,
    ip_address: { type: 'dhcp', ip: undefined },
  };

  const [subnet, setSubnet] = useState(value.subnet);
  const [ip_address, setIP] = useState(value.ip_address);
  const [visible, setVisible] = useState(!!value.subnet || false);
  const subnetItem = subnetsAvailable.find((i) => i.id === subnet);

  const triggerChange = (changedValue) => {
    const item = {
      ...value,
      subnet,
      ip_address,
      ...changedValue,
    };
    onChange && onChange(item);
  };

  const handleSelectChange = (e, option) => {
    setSubnet(option.value);
    setVisible(true);
    triggerChange({
      subnet: option.value,
    });
  };

  const handleIPChange = (v) => {
    setIP(v);
    triggerChange({
      ip_address: v,
    });
  };

  return (
    <Row gutter={[16, 16]}>
      <Col span={8}>
        <Select
          placeholder={t('Please select')}
          options={subnetsAvailable}
          value={subnet}
          onChange={handleSelectChange}
        />
        {subnetItem && (
          <div style={{ marginTop: 16 }}>{`${t('Cidr')}: ${
            subnetItem.cidr
          }`}</div>
        )}
      </Col>
      {subnetItem && visible && (
        <Col span={14}>
          <IPAddress
            value={ip_address}
            version={subnetItem.ip_version || 4}
            onChange={handleIPChange}
          />
        </Col>
      )}
    </Row>
  );
};

export default Item;
