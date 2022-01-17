import React, { useState, useEffect } from 'react';
import { Input, Select } from 'antd';

import { defaultCountries } from './countries';

export default function InternationalPhoneNumberInput({
  value,
  options,
  onChange,
}) {
  const [prefix, setPrefix] = useState(value.split(' ')[0]);
  const [number, setNumber] = useState(value.split(' ')[1]);

  useEffect(() => {
    const [oldPrefix, oldNumber] = value.split(' ');
    if (oldPrefix !== prefix || oldNumber !== number) {
      setPrefix(oldPrefix);
      setNumber(oldNumber);
    }
  }, [value]);

  const triggerChange = (changedValue) => {
    const newValue = {
      prefix,
      number,
      ...changedValue,
    };
    onChange(`${newValue.prefix} ${newValue.number}`);
  };

  return (
    <Input.Group compact>
      <Select
        showSearch
        value={prefix}
        onChange={(val) => {
          setPrefix(val);
          triggerChange({ prefix: val });
        }}
        style={{ width: '50%' }}
        options={options}
        filterOption={(inputValue, option) =>
          option.label.toLowerCase().includes(inputValue.toLowerCase())
        }
        getPopupContainer={() => document.body}
      />
      <Input
        value={number}
        onChange={(e) => {
          const newVal = e.target.value;
          setNumber(newVal);
          triggerChange({ number: newVal });
        }}
        style={{ width: '50%' }}
      />
    </Input.Group>
  );
}

InternationalPhoneNumberInput.defaultProps = {
  value: '+86 ',
  options: defaultCountries,
};
