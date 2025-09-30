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
import PropTypes from 'prop-types';
import { isEmpty } from 'lodash';
import {
  Form,
  Input,
  InputNumber,
  Divider,
  Slider,
  Tooltip,
  DatePicker,
  TimePicker,
} from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import AceEditor from 'react-ace';
import MemberAllocator from 'components/FormItem/MemberAllocator';
import JsonInput from 'components/FormItem/JsonInput';
import Select from './Select';
import Label from './Label';
import SelectTable from './SelectTable';
import InstanceVolume from './InstanceVolume';
import More from './More';
import Upload from './Upload';
import AddSelect from './AddSelect';
import IpInputSimple from './IpInputSimple';
import NetworkSelect from './NetworkSelect';
import Radio from './Radio';
import Descriptions from './Descriptions';
import NameInput from './NameInput';
import PortRange from './PortRange';
import SliderInput from './SliderInput';
import Title from './Title';
import Switch from './Switch';
import Checkbox from './Checkbox';
import Transfer from './Transfer';
import NUMAInput from './NUMAInput';
import CheckboxGroup from './CheckboxGroup';
import TextareaFromFile from './TextareaFromFile';
import IPDistributor from './IPDistributor';
import MacAddressInput from './MacAddressInput';
import InputInt from './InputInt';
import MetadataTransfer from './MetadataTransfer';
import NetworkSelectTable from './NetworkSelectTable';
import VolumeSelectTable from './VolumeSelectTable';
import TabSelectTable from './TabSelectTable';
import TreeSelect from './TreeSelect';
import SelectWithInput from './SelectWithInput';
import InternationalPhoneNumberInput from './InternationalPhoneNumberInput';
import Loading from './Loading';
// import styles from './index.less';

export const type2component = {
  label: Label,
  input: Input,
  select: Select,
  divider: Divider,
  'short-divider': Divider,
  radio: Radio,
  'select-table': SelectTable,
  'input-number': InputNumber,
  'input-int': InputInt,
  'instance-volume': InstanceVolume,
  'input-password': Input.Password,
  'input-name': NameInput,
  'port-range': PortRange,
  more: More,
  textarea: Input.TextArea,
  upload: Upload,
  'add-select': AddSelect,
  'ip-input': IpInputSimple,
  'network-select': NetworkSelect,
  'member-allocator': MemberAllocator,
  descriptions: Descriptions,
  slider: Slider,
  'slider-input': SliderInput,
  title: Title,
  switch: Switch,
  check: Checkbox,
  transfer: Transfer,
  'time-picker': TimePicker,
  'date-picker': DatePicker,
  NUMA: NUMAInput,
  'check-group': CheckboxGroup,
  'textarea-from-file': TextareaFromFile,
  'range-picker': DatePicker.RangePicker,
  'ip-distributor': IPDistributor,
  'mac-address': MacAddressInput,
  'network-select-table': NetworkSelectTable,
  'volume-select-table': VolumeSelectTable,
  'tab-select-table': TabSelectTable,
  'metadata-transfer': MetadataTransfer,
  aceEditor: AceEditor,
  'input-json': JsonInput,
  'tree-select': TreeSelect,
  'select-input': SelectWithInput,
  phone: InternationalPhoneNumberInput,
  loading: Loading,
};

export default class FormItem extends React.Component {
  static propTypes = {
    component: PropTypes.object,
    type: PropTypes.string,
    content: PropTypes.any,
    className: PropTypes.string,
    name: PropTypes.string,
    label: PropTypes.string,
    rules: PropTypes.array,
    required: PropTypes.bool,
    validator: PropTypes.func,
    options: PropTypes.array,
    placeholder: PropTypes.string,
    mode: PropTypes.string,
    onChange: PropTypes.func,
    dependencies: PropTypes.array,
    formref: PropTypes.object,
    hasRequiredCheck: PropTypes.bool,
  };

  static defaultProps = {
    required: false,
    dependencies: [],
  };

  getComponentProps(type) {
    switch (type) {
      case 'label': {
        const { content, icon, iconType, showLoading } = this.props;
        return { content, icon, iconType, showLoading };
      }
      case 'divider':
        return {
          className: this.props.className,
        };
      case 'select': {
        const {
          options,
          placeholder,
          mode,
          onChange,
          isWrappedValue,
          tip,
          disabled,
          showSearch,
          optionFilterProp = 'label',
          checkOptions,
          checkBoxInfo,
          allowClear,
          required,
          ...rest
        } = this.props;
        return {
          options,
          placeholder,
          mode,
          onChange,
          isWrappedValue,
          tip,
          disabled,
          showSearch,
          optionFilterProp,
          checkOptions,
          checkBoxInfo,
          allowClear: required ? allowClear || false : allowClear,
          ...rest,
        };
      }
      default: {
        const { validator, ...rest } = this.props;
        return { ...rest };
      }
    }
  }

  getFormItemProps() {
    const {
      name,
      label,
      type,
      help,
      extra,
      className,
      style,
      hidden,
      labelCol,
      wrapperCol,
      tip,
      dependencies,
    } = this.props;
    const base = {
      name,
      label: this.renderLabel(label, tip),
      help,
      extra,
      className,
      style,
      hidden,
      labelCol,
      wrapperCol,
      rules: this.getRules(),
    };
    if (dependencies && dependencies.length > 0) {
      base.dependencies = dependencies;
    }
    switch (type) {
      case 'title':
        return {
          ...base,
          label: '',
          labelCol: null,
          wrapperCol: {
            xs: {
              span: 24,
            },
            sm: {
              span: 24,
            },
          },
        };
      case 'label':
        return {
          ...base,
          className: 'form-item-text',
        };
      case 'select-table':
      case 'network-select-table':
      case 'tab-select-table':
      case 'instance-volume':
      case 'network-select':
      case 'add-select':
      case 'descriptions':
      case 'short-divider':
      case 'transfer':
      case 'NUMA':
      case 'check-group':
        return {
          ...base,
          wrapperCol: wrapperCol || {
            xs: {
              span: 24,
            },
            sm: {
              span: label ? 18 : 24,
            },
          },
        };
      default:
        return base;
    }
  }

  getSelectTableValidator = (rule, value) => {
    const { selectedRowKeys = [] } = value || {};
    if (selectedRowKeys.length === 0) {
      return Promise.reject(
        new Error(
          rule.placeholder || t('Please select {label}!', { label: rule.label })
        )
      );
    }
    return Promise.resolve();
  };

  getDescriptionValidator = (rule, value) => {
    if (value && value.length > 255) {
      return Promise.reject(
        new Error(
          `${t('Invalid: ')}${t(
            'The description can be up to 255 characters long.'
          )}`
        )
      );
    }
    return Promise.resolve();
  };

  getRules() {
    const {
      required,
      rules,
      validator,
      type = '',
      otherRule,
      name,
      hidden,
      label,
      placeholder,
      hasRequiredCheck = true,
    } = this.props;
    if (hidden) {
      return [];
    }
    if (rules) {
      return rules;
    }
    const newRules = [];
    const newRule = {};
    const requiredRule = {};
    if (required) {
      if (type && type.includes('select-table')) {
        requiredRule.required = true;
        requiredRule.validator = (rule, value) =>
          this.getSelectTableValidator({ ...rule, ...this.props }, value);
      } else if (type && type.includes('select')) {
        requiredRule.required = true;
        requiredRule.message =
          placeholder || t('Please select {label}!', { label });
      } else if (hasRequiredCheck) {
        requiredRule.required = true;
        requiredRule.message =
          placeholder || t('Please input {label}!', { label });
      } else if (validator) {
        newRule.required = required;
      }
    }
    if (!isEmpty(requiredRule)) {
      newRules.push(requiredRule);
    }
    if (validator) {
      newRule.validator = validator;
    } else if (type && type.includes('textarea') && name === 'description') {
      newRule.validator = this.getDescriptionValidator;
    }
    if (!isEmpty(newRule)) {
      newRules.push(newRule);
    }
    if (otherRule) {
      newRules.push(otherRule);
    }
    return newRules;
  }

  getComponent(type) {
    return type2component[type];
  }

  renderTip(tip) {
    if (!tip) {
      return null;
    }
    return (
      <Tooltip title={tip}>
        <QuestionCircleOutlined />
      </Tooltip>
    );
  }

  renderLabel(label, tip) {
    if (!tip) {
      return label;
    }
    return (
      <span>
        {label}&nbsp;{this.renderTip(tip)}
      </span>
    );
  }

  render() {
    const { component, type } = this.props;
    const formItemProps = this.getFormItemProps();
    if (component) {
      return <Form.Item {...formItemProps}>{component}</Form.Item>;
    }
    const TypeComp = this.getComponent(type);
    const props = this.getComponentProps(type);
    if (type === 'divider') {
      return <Divider className="form-item-divider" />;
    }
    if (type === 'short-divider') {
      return (
        <Form.Item {...formItemProps} label=" " style={{ marginBottom: 0 }}>
          <Divider />
        </Form.Item>
      );
    }
    if (TypeComp) {
      if (TypeComp.isFormItem) {
        return (
          <TypeComp formItemProps={formItemProps} componentProps={props} />
        );
      }
      const curComp = <TypeComp {...props} />;
      return <Form.Item {...formItemProps}>{curComp}</Form.Item>;
    }
    const { content } = this.props;
    if (content) {
      return (
        <Form.Item {...formItemProps}>
          <span {...props}>{content}</span>
        </Form.Item>
      );
    }
    return null;
  }
}
