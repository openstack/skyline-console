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
import { Form, Button, Row, Col, Select } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import SelectTable from 'components/FormItem/SelectTable';
import { ipValidate } from 'utils/validate';
import { Address4, Address6 } from 'ip-address';
import Item from './Item';

const { isIPv4, isIpv6 } = ipValidate;

const MemberAllocator = ({ componentProps, formItemProps }) => {
  const {
    maxNumber = 10,
    ports,
    isLoading,
    members = [],
    lbSubnetId,
  } = componentProps;
  const { name, onChange } = formItemProps;

  const [currentFieldsLength, setLength] = useState(0);

  const triggerChange = (data) => {
    onChange && onChange(data);
  };

  let addOuter = () => {};

  return (
    <div style={{ padding: 20 }}>
      <Form.Item
        label={t('select an existing port')}
        wrapperCol={{
          xs: 18,
          xm: 12,
        }}
        extra={t(
          'If you choose a port which subnet is different from the subnet of LB, please ensure connectivity between the two.'
        )}
      >
        <SelectTable
          maxSelectedCount={-1}
          isLoading={isLoading}
          data={ports}
          columns={[
            {
              title: t('ID/Name'),
              dataIndex: 'name',
              routeName: 'portDetail',
            },
            {
              title: t('Binding Instance'),
              dataIndex: 'server_name',
            },
            {
              title: t('Instance Name'),
              dataIndex: 'instance_name',
            },
            {
              title: t('IP'),
              dataIndex: 'fixed_ips',
              render: (fixed_ips, record) => {
                if (fixed_ips.length === 0) {
                  return '-';
                }
                const options = fixed_ips.map((i) => ({
                  label: i.ip_address,
                  value: i.ip_address,
                  subnet_id: i.subnet_id,
                }));
                record.currentOption = options[0].value;
                record.currentSubnetId = options[0].subnet_id;
                return (
                  <Select
                    style={{ minWidth: 200 }}
                    options={options}
                    defaultValue={options[0].value}
                    onChange={(e, opt) => {
                      record.currentSubnetId = opt.subnet_id;
                      record.currentOption = e;
                    }}
                  />
                );
              },
              sorter: (a, b) => {
                // const ipA = a.fixed_ips[0].ip_address.split('.').map(e => e.padStart(3, '0')).join('');
                // const ipB = b.fixed_ips[0].ip_address.split('.').map(e => e.padStart(3, '0')).join('');
                const ipA = a.fixed_ips[0].ip_address;
                const ipB = b.fixed_ips[0].ip_address;
                const ipABigInteger = (
                  Address4.isValid(ipA) ? new Address4(ipA) : new Address6(ipA)
                ).bigInteger();
                const ipBBigInteger = (
                  Address4.isValid(ipB) ? new Address4(ipB) : new Address6(ipB)
                ).bigInteger();
                return ipABigInteger.compareTo(ipBBigInteger);
              },
            },
            {
              title: t('Action'),
              key: 'operation',
              render: (txt, record) => (
                <Button
                  disabled={!record.currentOption}
                  onClick={() => {
                    addOuter({
                      ip_address: {
                        ip: record.currentOption,
                        protocol_port: undefined,
                        weight: 1,
                        name: record.server_name,
                        subnet_id: record.currentSubnetId,
                      },
                      canEdit: false,
                    });
                  }}
                >
                  {t('Add Member')}
                </Button>
              ),
            },
          ]}
          filterParams={[
            {
              label: t('ID'),
              name: 'id',
            },
            {
              label: t('Name'),
              name: 'name',
            },
            {
              label: t('Binding Instance'),
              name: 'server_name',
            },
            {
              label: t('IP'),
              name: 'fixed_ips',
              filterFunc: (record, val) =>
                record.some((item) => item.ip_address.indexOf(val) > -1),
            },
            {
              label: t('Same subnet with LB'),
              name: 'origin_data',
              options: [
                {
                  label: t('True'),
                  key: true,
                },
              ],
              filterFunc: (record, val) => {
                return val
                  ? record.fixed_ips.some(
                      (item) => item.subnet_id === lbSubnetId
                    )
                  : true;
              },
            },
          ]}
        />
      </Form.Item>
      <Form.Item {...formItemProps} label={t('Selected Members')}>
        <Form.List name={name}>
          {(fields, { add, remove }) => {
            addOuter = add;
            setLength(fields.length);
            if (fields.length === 0) {
              return t('Not yet selected');
            }
            return (
              <>
                {fields.length > 0 && (
                  <Row gutter={[16, 16]}>
                    <Col span={22}>
                      <Row>
                        <Col span={12}>
                          <div
                            style={{
                              with: '100%',
                              paddingLeft: 8,
                              paddingRight: 8,
                            }}
                          >
                            {t('IP Address')}
                          </div>
                        </Col>
                        <Col span={6}>
                          <div
                            style={{
                              with: '100%',
                              paddingLeft: 8,
                              paddingRight: 8,
                            }}
                          >
                            {t('Port')}
                          </div>
                        </Col>
                        <Col span={6}>
                          <div
                            style={{
                              with: '100%',
                              paddingLeft: 8,
                              paddingRight: 8,
                            }}
                          >
                            {t('Weights')}
                          </div>
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                )}
                {fields.map((field) => (
                  <Row key={field.key} gutter={[16, 16]}>
                    <Col span={22}>
                      <Form.Item
                        {...field}
                        style={{ width: '98%' }}
                        validateTrigger={['onChange', 'onBlur']}
                        rules={[
                          {
                            required: true,
                            validator: (rule, value1) => {
                              const member = members.filter(
                                (it) =>
                                  it.address === value1.ip_address.ip &&
                                  it.protocol_port ===
                                    value1.ip_address.protocol_port
                              );
                              if (!value1 || !value1.ip_address.ip) {
                                return Promise.reject(
                                  new Error(t('Missing IP Address'))
                                );
                              }
                              if (
                                !(
                                  isIPv4(value1.ip_address.ip) ||
                                  isIpv6(value1.ip_address.ip)
                                )
                              ) {
                                return Promise.reject(
                                  new Error(t('Invalid IP Address'))
                                );
                              }
                              if (!value1.ip_address.ip) {
                                return Promise.reject(
                                  new Error(t('Missing Port'))
                                );
                              }
                              if (!value1.ip_address.protocol_port) {
                                return Promise.reject(
                                  new Error(t('Missing Port'))
                                );
                              }
                              if (!value1.ip_address.weight) {
                                return Promise.reject(
                                  new Error(t('Missing Weight'))
                                );
                              }
                              if (member[0]) {
                                return Promise.reject(
                                  new Error(t('Invalid IP Address and Port'))
                                );
                              }
                              return Promise.resolve(true);
                            },
                          },
                        ]}
                      >
                        <Item
                          field={field}
                          onChange={(val) => triggerChange(val)}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={2}>
                      <MinusCircleOutlined onClick={() => remove(field.name)} />
                    </Col>
                  </Row>
                ))}
              </>
            );
          }}
        </Form.List>
      </Form.Item>
      {currentFieldsLength < maxNumber && (
        <Form.Item
          label={t('Add External Members')}
          extra={t(
            'The ip of external members can be any, including the public network ip.'
          )}
        >
          <Button
            type="dashed"
            onClick={() => {
              addOuter();
            }}
            block
            icon={<PlusOutlined />}
          >
            {t('Add External Members')}
          </Button>
        </Form.Item>
      )}
    </div>
  );
};

MemberAllocator.isFormItem = true;

export default MemberAllocator;
