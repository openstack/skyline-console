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
import { Modal } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  QuestionCircleFilled,
} from '@ant-design/icons';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import { unescapeHtml } from 'utils/index';
import styles from './index.less';

const normalProps = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  content: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  onOk: PropTypes.func,
  onCancel: PropTypes.func,
  icon: PropTypes.node,
  isSubmitting: PropTypes.bool,
  cancelText: PropTypes.string,
  okText: PropTypes.string,
  className: PropTypes.string,
  okButtonProps: PropTypes.any,
  cancelButtonProps: PropTypes.any,
};

const confirm = (props) => {
  const {
    title = t('Confirm'),
    content,
    onOk,
    onCancel,
    icon,
    okText = t('Confirm'),
    cancelText = t('Cancel'),
    className,
    okButtonProps = {},
    cancelButtonProps = {},
  } = props;
  Modal.confirm({
    title,
    icon: icon || <QuestionCircleFilled className={styles.warn} />,
    className: classnames(styles['confirm-modal'], className),
    content: unescapeHtml(content),
    okText,
    cancelText,
    okButtonProps: okButtonProps || {},
    cancelButtonProps: cancelButtonProps || {},
    onOk() {
      return onOk && onOk();
    },
    onCancel() {
      onCancel && onCancel();
    },
  });
};

confirm.propTypes = normalProps;
confirm.defaultProps = {
  title: t('Confirm'),
  icon: <QuestionCircleFilled />,
  isSubmitting: false,
  okText: t('Confirm'),
  cancelText: t('Cancel'),
};

const error = (props) => {
  const newProps = {
    title: t('Error'),
    ...props,
    icon: <CloseCircleOutlined className={styles.error} />,
  };
  confirm(newProps);
};

const warn = (props) => {
  const newProps = {
    title: t('Warn'),
    ...props,
    icon: <QuestionCircleFilled className={styles.warn} />,
  };
  confirm(newProps);
};

const success = (props) => {
  const newProps = {
    title: t('Success'),
    ...props,
    icon: <CheckCircleOutlined className={styles.success} />,
  };
  confirm(newProps);
};

export default {
  confirm,
  error,
  warn,
  success,
};
