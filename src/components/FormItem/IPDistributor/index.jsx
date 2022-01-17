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

import React from 'react';
import { Form, Button, Row, Col } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import Item from 'components/FormItem/IPDistributor/Item';
import { ipValidate } from 'utils/validate';

const { isIPv4, isIpv6 } = ipValidate;

const IPDistributor = ({ componentProps, formItemProps }) => {
  const { subnets, maxNumber = 10, formRef } = componentProps;
  const { name, value = [], onChange } = formItemProps;
  const subnetsAvailable = subnets
    .map((item) => ({ label: item.name, value: item.id, ...item }))
    .filter(
      (item) => !value.some((i) => (i ? i.subnet === item.value : false))
    );

  const triggerChange = (data) => {
    onChange && onChange(data);
  };

  return (
    <>
      <Form.Item {...formItemProps}>
        {subnetsAvailable.length === 0 ? (
          <div>{t('The selected network has no subnet')}</div>
        ) : (
          <Form.List name={name}>
            {(fields, { add, remove }) => (
              <>
                {fields.map((field) => (
                  <Row key={field.key} gutter={[16, 16]}>
                    <Col span={22}>
                      <Form.Item
                        {...field}
                        validateTrigger={['onChange', 'onBlur']}
                        rules={[
                          {
                            required: true,
                            validator: (rule, value1) => {
                              if (!value1 || !value1.subnet) {
                                return Promise.reject(
                                  new Error(t('Missing Subnet'))
                                );
                              }
                              if (value1.ip_address.type === 'manual') {
                                const { ip } = value1.ip_address || {};
                                if (!ip) {
                                  return Promise.reject(
                                    new Error(t('Missing IP Address'))
                                  );
                                }
                                if (!isIPv4(ip) && !isIpv6(ip)) {
                                  return Promise.reject(
                                    new Error(
                                      t('Invalid: Please input a valid ip')
                                    )
                                  );
                                }
                              }
                              return Promise.resolve(true);
                            },
                          },
                        ]}
                      >
                        <Item
                          field={field}
                          subnetsAvailable={subnetsAvailable}
                          onChange={(val) => triggerChange(val)}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={2}>
                      <MinusCircleOutlined
                        onClick={() => {
                          remove(field.name);
                          formRef.current.validateFields([name]);
                        }}
                      />
                    </Col>
                  </Row>
                ))}
                {fields.length < maxNumber && (
                  <Button
                    type="dashed"
                    onClick={() => {
                      add();
                      formRef.current.validateFields([name]);
                    }}
                    block
                    icon={<PlusOutlined />}
                  >
                    {t('Add IP')}
                  </Button>
                )}
              </>
            )}
          </Form.List>
        )}
      </Form.Item>
    </>
  );
};

IPDistributor.isFormItem = true;

export default IPDistributor;
