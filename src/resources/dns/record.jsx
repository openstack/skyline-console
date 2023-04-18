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
import { DNS_RECORD_TYPE } from 'src/utils/dns-rrtype';
import { ipValidate } from 'utils/validate';
import { isString } from 'lodash';

export const dnsRRTypeList = () => {
  return Object.keys(DNS_RECORD_TYPE)
    .sort()
    .map((item) => ({
      label: `${item} - ${DNS_RECORD_TYPE[item].name}`,
      value: item,
    }));
}

export const typeChange = (value) => {
  if (Object.keys(DNS_RECORD_TYPE).includes(value)) {
    this.setState({
      nameExtra: `Exp:${DNS_RECORD_TYPE[value].nameExtra}`,
      recordsExtra: isString(DNS_RECORD_TYPE[value].recordsExtra)
        ? `Exp: ${DNS_RECORD_TYPE[value].recordsExtra}`
        : '',
    });
  }
};

export const getRecordSetFormItem = (self, currentFormValue) => {
  return [
    {
      name: 'type',
      label: t('Type'),
      type: 'select',
      options: dnsRRTypeList(),
      onChange: (value) => {
        if (Object.keys(DNS_RECORD_TYPE).includes(value)) {
          self.setState({
            nameExtra: `Exp:${DNS_RECORD_TYPE[value].nameExtra}`,
            recordsExtra: isString(DNS_RECORD_TYPE[value].recordsExtra)
              ? `Exp: ${DNS_RECORD_TYPE[value].recordsExtra}`
              : '',
          });
        }
      },
      required: true,
    },
    {
      name: 'name',
      label: t('Name'),
      type: 'input',
      required: true,
      tip: () => (
        <div dangerouslySetInnerHTML={{ __html: self.state.nameExtra }} />
      ),
      extra: (
        <div dangerouslySetInnerHTML={{ __html: self.state.nameExtra }} />
      ),
    },
    {
      name: 'description',
      label: t('Description'),
      type: 'textarea',
    },
    {
      name: 'ttl',
      label: t('TTL'),
      type: 'input-number',
      required: true,
    },
    {
      name: 'records',
      label: t('Records'),
      type: 'add-select',
      isInput: true,
      required: true,
      width: 280,
      tip: () => (
        <div dangerouslySetInnerHTML={{ __html: self.state.recordsExtra }} />
      ),
      extra: (
        <div dangerouslySetInnerHTML={{ __html: self.state.recordsExtra }} />
      ),
      validator: (rule, value) => {
        const { type } = currentFormValue;
        const { isIPv4, isIpv6 } = ipValidate;

        return new Promise((resolve) => {
          value && value.forEach((item) => {
            if (type === 'A' && !isIPv4(item.value)) {
              throw new Error(t('Please enter a valid IPv4 value.'));
            } else if (type === 'AAAA' && !isIpv6(item.value))
              throw new Error(t('Please enter a valid IPv6 value.'));
          });

          resolve();
        });
      }
    },
  ];
};