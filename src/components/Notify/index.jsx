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
import { notification } from 'antd';
import PropTypes from 'prop-types';
import {
  InfoCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import CodeEditor from 'components/CodeEditor';
import ModalButton from 'components/ModalButton';
import globalRootStore from 'stores/root';
import { unescapeHtml } from 'utils/index';
import { statusMap } from 'src/utils/code';
import { isEmpty, isString } from 'lodash';
import { decode } from 'html-entities';
import styles from './index.less';

const open = (args) => {
  const {
    title = t('Error'),
    type = 'error',
    description = '',
    onClose,
    top = 48,
  } = args;

  let iconColor = '#F5222D';
  let icon = null;

  if (type === 'info') {
    iconColor = globalCSS.primaryColor;
    icon = <InfoCircleOutlined theme="filled" style={{ color: iconColor }} />;
  } else if (type === 'success') {
    iconColor = globalCSS.successColor;
    icon = <CheckCircleOutlined theme="filled" style={{ color: iconColor }} />;
  } else if (type === 'error') {
    iconColor = globalCSS.errorColor;
    icon = <CloseCircleOutlined theme="filled" style={{ color: iconColor }} />;
  } else if (type === 'process') {
    iconColor = globalCSS.primaryColor;
    icon = <LoadingOutlined style={{ color: iconColor }} />;
  } else if (type === 'warn') {
    iconColor = globalCSS.warnColor;
    icon = <InfoCircleOutlined theme="filled" style={{ color: iconColor }} />;
  }

  const duration = type === 'error' || type === 'warn' ? 0 : 4.5;

  notification.open({
    message: unescapeHtml(title),
    duration,
    icon,
    description: unescapeHtml(description),
    className: styles.notify,
    onClose,
    top,
    style: {
      whiteSpace: 'pre-line',
    },
  });
};

open.propTypes = {
  title: PropTypes.string,
  type: PropTypes.string,
  description: PropTypes.string,
};

const success = (title, description) => {
  open({
    title,
    description,
    type: 'success',
  });
};

const info = (title, description) => {
  open({
    title,
    description,
    type: 'info',
  });
};

const error = (title, description) => {
  globalRootStore.addNoticeCount();
  open({
    title,
    description,
    type: 'error',
    onClose: () => {
      globalRootStore.removeNoticeCount();
    },
  });
};

const warn = (title, description) => {
  open({
    title,
    description,
    type: 'warn',
  });
};

const process = (title, description) => {
  open({
    title,
    description,
    type: 'process',
  });
};

const errorWithDetail = (err, title) => {
  const { status, message } = err || {};
  let nTitle = title;
  let description;
  if (status && parseInt(status, 10) >= 500) {
    if (!isEmpty(message) && !statusMap[status]) {
      if (isString(message)) {
        nTitle += `${t('message')}${t('.')}`;
      } else if (message.reason) {
        nTitle += `${t('message.reason')}${t('.')}`;
      }
      nTitle += `${t('Status Code')}: ${status}`;
    } else {
      nTitle += statusMap[status];
    }
  } else {
    const decodeErr =
      err && isString(err) ? decode(err, { level: 'html5' }) : err;
    // prettier-ignore
    description = err
      ? <ModalButton
        style={{
          float: 'right',
        }}
        buttonType="link"
        buttonText={t('Click to show detail')}
        component={
          <CodeEditor
            className={styles['code-editor']}
            value={decodeErr}
            mode="json"
            options={{
              readOnly: true,
            }}
          />
        }
      />
      : ''
  }
  error(nTitle, description);
};

const Notify = {
  open,
  success,
  error,
  warn,
  info,
  process,
  errorWithDetail,
};

export default Notify;
