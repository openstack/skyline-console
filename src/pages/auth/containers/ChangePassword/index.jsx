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

import React, { Component } from 'react';
import { Input, Button } from 'antd';
import { Link } from 'react-router-dom';
import { InfoCircleFilled } from '@ant-design/icons';
import { getPasswordOtherRule } from 'utils/validate';
import { inject, observer } from 'mobx-react';
import { isEmpty } from 'lodash';
import { toJS } from 'mobx';
import globalUserStore from 'stores/keystone/user';
import Notify from 'components/Notify';
import SimpleForm from 'components/SimpleForm';
import styles from './index.less';

export class Password extends Component {
  formRef = null;

  constructor(props) {
    super(props);
    this.init();
    this.state = {
      error: false,
      message: '',
      loading: false,
    };
  }

  componentDidMount() {
    const { rootStore: { routing } = {} } = this.props;
    if (!this.passwordData || isEmpty(this.passwordData)) {
      routing.push('/auth/login');
    }
  }

  componentWillUnmount() {
    const { rootStore } = this.props;
    rootStore.setPasswordInfo(null);
  }

  get passwordData() {
    const { rootStore: { oldPassword } = {} } = this.props;
    return toJS(oldPassword) || {};
  }

  get defaultValue() {
    const { oldPassword } = this.passwordData;
    return {
      oldPassword,
    };
  }

  onFinish = (values) => {
    const { rootStore } = this.props;
    const { userId, oldPassword } = this.passwordData;
    const { password } = values;
    const body = {
      id: userId,
      password,
      original_password: oldPassword,
    };
    this.setState({
      loading: true,
    });
    globalUserStore.changePasswordUser(body).then(
      () => {
        this.setState({
          loading: false,
        });
        Notify.success(
          t('Password changed successfully, please log in again.')
        );
        rootStore.setPasswordInfo(null);
        rootStore.routing.push('/auth/login');
      },
      (err) => {
        const {
          reason: { message },
        } = err;
        this.setState({
          error: true,
          message,
          loading: false,
        });
      }
    );
  };

  getCount = (word) => {
    try {
      return word.split('be unique is ')[1].split('.')[0];
    } catch (e) {
      return 0;
    }
  };

  getErrorWord = (word) => {
    if (!word) {
      return t('Reset failed, please retry');
    }
    if (
      word.indexOf(
        'The new password cannot be identical to a previous password.'
      ) >= 0
    ) {
      const num = this.getCount(word);
      if (!num) {
        return t('The password must not be the same as the previous');
      }
      if (num === '2') {
        return t('The password must not be the same as the previous two');
      }
      return t('The password must not be the same as the previous {num}', {
        num,
      });
    }
    return t('Reset failed, please retry');
  };

  get formItems() {
    const { error, message, loading } = this.state;
    // const { password: oldPassword } = this.passwordData;
    const errorHint = this.getErrorWord(message);
    return [
      {
        name: 'hint',
        render: () => (
          <div className={styles.hint}>
            <InfoCircleFilled style={{ color: '#FAAD14' }} />
            {t('User need to change password')}
          </div>
        ),
      },
      {
        name: 'error',
        hidden: !error,
        render: () => (
          <div className={styles.error}>
            <InfoCircleFilled />
            {errorHint}
          </div>
        ),
      },
      // {
      //   name: 'oldPassword',
      //   required: true,
      //   message: t('Please input your current password!'),
      //   render: () => <Input.Password placeholder={t('Current Password')} />,
      // },
      {
        name: 'password',
        required: true,
        message: t('Please input your password!'),
        otherRule: getPasswordOtherRule('password', 'user', true),
        render: () => <Input.Password placeholder={t('Password')} />,
      },
      {
        name: 'confirmPassword',
        required: true,
        message: t('Please confirm your password!'),
        dependencies: ['password'],
        otherRule: getPasswordOtherRule('confirmPassword', 'user', true),
        render: () => <Input.Password placeholder={t('Confirm Password')} />,
      },
      {
        name: 'submit',
        className: styles.between,
        render: () => (
          <>
            <Button type="primary" htmlType="submit" loading={loading}>
              {t('Confirm')}
            </Button>
            <Link style={{ marginLeft: 50 }} to="/auth/login">
              {t('Back to login page')}
            </Link>
          </>
        ),
      },
    ];
  }

  init() {
    this.formRef = React.createRef();
  }

  render() {
    return (
      <>
        <h1 className={styles.welcome}>{t('Welcome')}</h1>
        <SimpleForm
          formRef={this.formRef}
          formItems={this.formItems}
          name="reset_password"
          className={styles.reset}
          onFinish={this.onFinish}
          initialValues={this.defaultValue}
          size="large"
          scrollToFirstError
        />
      </>
    );
  }
}

export default inject('rootStore')(observer(Password));
