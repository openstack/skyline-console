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
import { Input, Button, Select, Row, Col } from 'antd';
import { inject, observer } from 'mobx-react';
import { Link } from 'react-router-dom';
import { InfoCircleFilled } from '@ant-design/icons';
import SimpleForm from 'components/SimpleForm';
import globalSkylineStore from 'stores/skyline/skyline';
import i18n from 'core/i18n';
import { isEmpty } from 'lodash';
import styles from './index.less';

export class Login extends Component {
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
    this.getDomains();
    this.getRegions();
  }

  async getDomains() {
    await this.store.fetchDomainList();
    this.updateDefaultValue();
  }

  async getRegions() {
    await this.store.fetchRegionList();
    this.updateDefaultValue();
  }

  get rootStore() {
    return this.props.rootStore;
  }

  get info() {
    const { info = {} } = this.rootStore;
    return info || {};
  }

  get productName() {
    const {
      product_name: { zh = t('Cloud Platform'), en = 'Cloud Platform' } = {},
    } = this.info;
    const { isLocaleZh } = i18n;
    return t('Welcome, {name}', { name: isLocaleZh ? zh : en });
  }

  get domains() {
    return (this.store.domains || []).map((it) => ({
      label: it,
      value: it,
    }));
  }

  get regions() {
    return (this.store.regions || []).map((it) => ({
      label: it,
      value: it,
    }));
  }

  get nextPage() {
    const { location = {} } = this.props;
    const { search } = location;
    if (search) {
      return search.split('=')[1];
    }
    return '/base/overview';
  }

  get defaultValue() {
    const data = {};
    if (this.regions.length === 1) {
      data.region = this.regions[0].value;
    }
    if (this.domains.length === 1) {
      data.domain = this.domains[0].value;
    }
    return data;
  }

  get formItems() {
    const { error, loading } = this.state;
    // eslint-disable-next-line no-unused-vars
    const buttonProps = {
      block: true,
      type: 'primary',
    };
    return [
      {
        name: 'error',
        hidden: !error,
        render: () => (
          <div className={styles['login-error']}>
            <InfoCircleFilled />
            {this.getErrorMessage()}
          </div>
        ),
      },
      {
        name: 'region',
        required: true,
        message: t('Please select your Region!'),
        render: () => (
          <Select placeholder={t('Select a region')} options={this.regions} />
        ),
      },
      {
        name: 'domain',
        required: true,
        message: t('Please select your Domain!'),
        render: () => (
          <Select placeholder={t('Select a domain')} options={this.domains} />
        ),
      },
      {
        name: 'username',
        required: true,
        message: t('Please input your Username!'),
        render: () => <Input placeholder={t('Username')} />,
      },
      {
        name: 'password',
        required: true,
        message: t('Please input your Password!'),
        render: () => <Input.Password placeholder={t('Password')} />,
      },
      {
        name: 'extra',
        hidden: true,
        render: () => (
          <Row gutter={8}>
            <Col span={12}>
              <Link to="password">{t('Forgot your password?')}</Link>
            </Col>
            <Col span={12}>
              <Link to="register" className={styles.register}>
                {t('Sign up')}
              </Link>
            </Col>
          </Row>
        ),
      },
      {
        name: 'submit',
        render: () => (
          <Row gutter={8}>
            <Col span={12}>
              <Button
                loading={loading}
                type="primary"
                htmlType="submit"
                className="login-form-button"
              >
                {t('Log in')}
              </Button>
            </Col>
          </Row>
        ),
      },
    ];
  }

  getUserId = (str) => str.split(':')[1].trim().split('.')[0];

  onFinish = (values) => {
    this.setState({
      loading: true,
      message: '',
      error: false,
    });
    const { domain, password, region, username } = values;
    const body = { domain, password, region, username };
    this.rootStore.login(body).then(
      () => {
        this.setState({
          loading: false,
          error: false,
        });
        if (this.rootStore.user && !isEmpty(this.rootStore.user)) {
          this.rootStore.routing.push(this.nextPage);
        }
      },
      (error) => {
        this.setState({
          loading: false,
        });
        const {
          data: { detail },
        } = error.response;
        if (
          detail.includes(
            'The password is expired and needs to be changed for user'
          )
        ) {
          const userId = this.getUserId(detail);
          const data = {
            region: values.region,
            oldPassword: values.password,
            userId,
          };
          this.rootStore.setPasswordInfo(data);
          this.rootStore.routing.push('/auth/change-password');
        } else {
          this.setState({
            error: true,
            message: detail,
          });
        }
      }
    );
  };

  getErrorMessage() {
    const { message } = this.state;
    if (message.includes('The account is locked for user')) {
      return t(
        'Frequent login failure will cause the account to be temporarily locked, please operate after 5 minutes'
      );
    }
    if (message.includes('The account is disabled for user')) {
      return t('The user has been disabled, please contact the administrator');
    }
    if (
      message.includes('You are not authorized for any projects or domains')
    ) {
      return t(
        'If you are not authorized to access any project, or if the project you are involved in has been deleted or disabled, contact the platform administrator to reassign the project'
      );
    }
    return t('Username or password is incorrect');
  }

  updateDefaultValue = () => {
    this.formRef.current.resetFields();
    if (this.formRef.current && this.formRef.current.resetFields) {
      this.formRef.current.resetFields();
    }
  };

  init() {
    this.store = globalSkylineStore;
    this.formRef = React.createRef();
  }

  renderExtra() {
    return null;
  }

  render() {
    return (
      <>
        <h1 className={styles.welcome}>{this.productName}</h1>
        <SimpleForm
          formItems={this.formItems}
          name="normal_login"
          className={styles['login-form']}
          initialValues={this.defaultValue}
          onFinish={this.onFinish}
          formRef={this.formRef}
          size="large"
        />
        {this.renderExtra()}
      </>
    );
  }
}

export default inject('rootStore')(observer(Login));
