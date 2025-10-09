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
import { Select, Checkbox, Row, Col, Form, InputNumber } from 'antd';
import PropTypes from 'prop-types';
import styles from './index.less';

export default class InstanceVolume extends React.Component {
  constructor(props) {
    super(props);

    const { value = {}, minSize } = props;

    this.state = {
      ...value,
      minSize,
      validateStatus: undefined,
      errorMsg: undefined,
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { value = {}, minSize, options } = nextProps;

    // Only updates when options or minSize changes
    const hasOptionChanged = options !== prevState.options;
    const hasMinSizeChanged = minSize !== prevState.minSize;

    if (hasOptionChanged || hasMinSizeChanged) {
      // If minSize changed and current size is smaller than new minSize, update size
      const currentSize = value.size || prevState.size;
      const nextSize = Math.max(minSize, currentSize);

      return {
        ...value,
        size: nextSize,
        options,
        minSize,
      };
    }
    return null;
  }

  componentDidMount() {
    this.triggerChange();
  }

  componentDidUpdate(prevProps, prevState) {
    const { defaultOptionValue, options, minSize } = this.props;
    const { size } = this.state;

    // Detecting defaultOptionValue updates
    // If the defaultOptionValue exists in the options, update the select value
    if (
      defaultOptionValue &&
      defaultOptionValue !== prevProps.defaultOptionValue
    ) {
      const optionExists = options.some(
        (option) => option.value === defaultOptionValue
      );

      if (optionExists) {
        this.handleTypeChange(defaultOptionValue);
      }
    }

    // Checks both `minSize` and `size` actually changed;
    // Prevents extra onChange triggers when nothing meaningful changed.
    if (prevState.size !== size && prevProps.minSize !== minSize) {
      this.triggerChange();
    }
  }

  validateVolume = (callback) => {
    const { type, size, minSize } = this.state;
    if (!type) {
      this.setState(
        {
          errorMsg: t('Please select a type!'),
          validateStatus: 'error',
        },
        callback
      );
      return;
    }
    if (!size || size < minSize) {
      this.setState(
        {
          errorMsg: t('Please set a size no less than {minSize} GiB!', {
            minSize,
          }),
          validateStatus: 'error',
        },
        callback
      );
      return;
    }
    this.setState(
      {
        errorMsg: undefined,
        validateStatus: 'success',
      },
      callback
    );
  };

  triggerChange = () => {
    const { onChange, options = [] } = this.props;
    if (!onChange) return;

    this.validateVolume(() => {
      const { type, deleteType, ...restStates } = this.state;
      const deleteTypeLabel =
        deleteType === 1
          ? t('Deleted with the instance')
          : t('Not deleted with the instance');
      const typeOption = options.find((it) => it.value === type);

      onChange({
        ...restStates,
        type,
        deleteType,
        deleteTypeLabel,
        typeOption,
      });
    });
  };

  handleTypeChange = (type) => {
    this.setState({ type }, this.triggerChange);
  };

  handleSizeChange = (size) => {
    const { minSize } = this.state;
    this.setState({ size: size ?? minSize }, this.triggerChange);
  };

  handleDeleteToggle = () => {
    this.setState(
      ({ deleteType }) => ({ deleteType: 1 - deleteType }),
      this.triggerChange
    );
  };

  render() {
    const { type, size, deleteType, validateStatus, errorMsg, minSize } =
      this.state;

    const { options, name, showDelete = true } = this.props;

    return (
      <Form.Item
        className={styles['instance-volume']}
        name={name}
        validateStatus={validateStatus}
        help={errorMsg}
      >
        <Row gutter={24}>
          <Col span={8}>
            <span className={styles.label}>{t('Type')}</span>
            <Select
              value={type}
              options={options}
              onChange={this.handleTypeChange}
              className={styles.select}
              placeholder={t('Please select type')}
            />
          </Col>
          <Col span={14}>
            <span className={styles.label}>{t('Size')}</span>
            <InputNumber
              value={size}
              min={minSize}
              onChange={this.handleSizeChange}
              style={{ maxWidth: '60%' }}
              precision={0}
            />
            <span className={styles['size-label']}>GiB</span>
            {showDelete && (
              <Checkbox
                checked={deleteType === 1}
                onChange={this.handleDeleteToggle}
              >
                {t('Deleted with the instance')}
              </Checkbox>
            )}
          </Col>
        </Row>
      </Form.Item>
    );
  }
}

InstanceVolume.propTypes = {
  options: PropTypes.arrayOf(PropTypes.object),
  value: PropTypes.shape(PropTypes.object),
  minSize: PropTypes.number,
  defaultOptionValue: PropTypes.string,
  onChange: PropTypes.func,
  name: PropTypes.string,
  showDelete: PropTypes.bool,
};

InstanceVolume.defaultProps = {
  options: [],
  value: {},
  minSize: 0,
  defaultOptionValue: undefined,
  onChange: undefined,
  name: '',
  showDelete: true,
};
