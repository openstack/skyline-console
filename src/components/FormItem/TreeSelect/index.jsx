import React, { Component } from 'react';
import { TreeSelect } from 'antd';
import PropTypes from 'prop-types';

export default class Index extends Component {
  onChange = (value) => {
    const { onChange } = this.props;
    if (onChange) {
      onChange(value);
    }
  };

  getValue = () => {
    const { value, isWrappedValue } = this.props;
    if (value === undefined) return value;
    return isWrappedValue ? value.value : value;
  };

  render() {
    const {
      treeData,
      placeholder = t('Please select'),
      disabled = false,
    } = this.props;
    return (
      <TreeSelect
        className={this.props.className}
        showSearch
        allowClear
        placeholder={placeholder}
        treeData={treeData}
        disabled={disabled}
        value={this.getValue()}
        onChange={this.onChange}
      />
    );
  }
}

Index.propTypes = {
  value: PropTypes.oneOfType([PropTypes.array, PropTypes.string]),
  isWrappedValue: PropTypes.bool,
  treeData: PropTypes.array,
  onChange: PropTypes.func,
};
