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
      loginTypeOption: this.passwordOption,
    };
  }

  componentDidMount() {
    this.getDomains();
    this.getRegions();
    this.getSSO();
  }

  async getDomains() {
    await this.store.fetchDomainList();
    this.updateDefaultValue();
  }

  async getRegions() {
    await this.store.fetchRegionList();
    this.updateDefaultValue();
  }

  async getSSO() {
    try {
      this.store.fetchSSO();
    } catch (e) {
      console.log(e);
    }
  }

  get rootStore() {
    return this.props.rootStore;
  }

  get info() {
    const { info = {} } = this.rootStore;
    return info || {};
  }

  get productName() {
    const { product_name = { zh: t('Openstack Flex'), en: 'Openstack Flex' } } =
      this.info;
    const { getLocaleShortName } = i18n;
    const language = getLocaleShortName();
    const name =
      product_name[language] || t('Openstack Flex') || 'Openstack Flex';
    return t('Welcome to {name}', { name });
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

  get enableSSO() {
    const { sso: { enable_sso = false } = {} } = this.store;
    return enable_sso;
  }

  get ssoProtocols() {
    return {
      openid: t('OpenID Connect'),
    };
  }

  get SSOOptions() {
    if (!this.enableSSO) {
      return [];
    }
    const { sso: { protocols = [] } = {} } = this.store;
    return protocols.map((it) => {
      const { protocol, url } = it;
      return {
        label: this.ssoProtocols[protocol] || protocol,
        value: url,
        ...it,
      };
    });
  }

  get passwordOption() {
    return {
      label: t('Keystone Credentials'),
      value: 'password',
    };
  }

  get loginTypeOptions() {
    if (!this.enableSSO) {
      return [];
    }
    return [this.passwordOption, ...this.SSOOptions];
  }

  onLoginTypeChange = (value, option) => {
    this.setState({ loginTypeOption: option });
  };

  get currentLoginType() {
    const { loginTypeOption: { value } = {} } = this.state;
    if (value === 'password') {
      return 'password';
    }
    return 'sso';
  }

  get currentSSOLink() {
    const { loginTypeOption: { value } = {} } = this.state;
    return value;
  }

  get defaultValue() {
    const data = {
      loginType: 'password',
    };
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
    const loginType = this.currentLoginType;
    const errorItem = {
      name: 'error',
      hidden: !error,
      render: () => (
        <div className={styles['login-error']}>
          <InfoCircleFilled />
          {this.getErrorMessage()}
        </div>
      ),
    };
    const regionItem = {
      name: 'region',
      required: true,
      message: t('Please select your Region!'),
      render: () => (
        <Select placeholder={t('Select a region')} options={this.regions} />
      ),
    };
    // const domainItem = {
    //   name: 'domain',
    //   required: true,
    //   message: t('Please select your Domain!'),
    //   render: () => (
    //     <Select placeholder={t('Select a domain')} options={this.domains} />
    //   ),
    // };
    const domainItem = {
      name: 'domain',
      required: true,
      message: t('Please input your Domain!'),
      render: () => (
        <div>
          <Input placeholder={t('Domain')} />
          <div className={styles['domain-dropdown']}>
            {this.domains.map(domain => (
              <div key={domain.value} className={styles['domain-option']}>
                {domain.label}
              </div>
            ))}
          </div>
        </div>
      ),
    };
    const usernameItem = {
      name: 'username',
      required: true,
      message: t('Please input your Username!'),
      render: () => <Input placeholder={t('Username')} />,
    };
    const passwordItem = {
      name: 'password',
      required: true,
      message: t('Please input your Password!'),
      render: () => <Input.Password placeholder={t('Password')} />,
    };
    const extraItem = {
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
    };
    const submitItem = {
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
    };
    const namePasswordItems = [
      errorItem,
      regionItem,
      domainItem,
      usernameItem,
      passwordItem,
      extraItem,
    ];
    const typeItem = {
      name: 'loginType',
      required: true,
      message: t('Please select login type!'),
      extra: t(
        'If you are not sure which authentication method to use, please contact your administrator.'
      ),
      render: () => (
        <Select
          placeholder={t('Select a login type')}
          options={this.loginTypeOptions}
          onChange={this.onLoginTypeChange}
        />
      ),
    };
    if (this.enableSSO) {
      if (loginType === 'password') {
        return [typeItem, ...namePasswordItems, submitItem];
      }

      return [typeItem, submitItem];
    }
    return [...namePasswordItems, submitItem];
  }

  getUserId = (str) => str.split(':')[1].trim().split('.')[0];

  onLoginFailed = (error, values) => {
    this.setState({
      loading: false,
    });
    const {
      data: { detail = '' },
    } = error.response;
    const message = detail || '';
    if (
      message.includes(
        'The password is expired and needs to be changed for user'
      )
    ) {
      this.dealWithChangePassword(message, values);
    } else {
      this.setState({
        error: true,
        message,
      });
    }
  };

  onLoginSuccess = () => {
    this.setState({
      loading: false,
      error: false,
    });
    if (this.rootStore.user && !isEmpty(this.rootStore.user)) {
      this.rootStore.routing.push(this.nextPage);
    }
  };

  onFinish = (values) => {
    if (this.currentLoginType === 'sso') {
      document.location.href = this.currentSSOLink;
      return;
    }
    this.setState({
      loading: true,
      message: '',
      error: false,
    });
    const { domain, password, region, username } = values;
    const body = { domain, password, region, username };
    this.rootStore.login(body).then(
      () => {
        this.onLoginSuccess();
      },
      (error) => {
        this.onLoginFailed(error, values);
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

  dealWithChangePassword = (detail, values) => {
    const userId = this.getUserId(detail);
    const data = {
      region: values.region,
      oldPassword: values.password,
      userId,
    };
    this.rootStore.setPasswordInfo(data);
    this.rootStore.routing.push('/auth/change-password');
  };

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
          formref={this.formRef}
          size="large"
        />
        {this.renderExtra()}
      </>
    );
  }
}

export default inject('rootStore')(observer(Login));
