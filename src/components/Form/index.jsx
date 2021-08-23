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
import { isFunction, has, isObject, isEmpty } from 'lodash';
import Notify from 'components/Notify';
import { Row, Col, Form, Button, Spin } from 'antd';
import classnames from 'classnames';
import { InfoCircleOutlined } from '@ant-design/icons';
import { isAdminPage, firstUpperCase, unescapeHtml } from 'utils/index';

import { parse } from 'qs';
import FormItem from 'components/FormItem';
import styles from './index.less';

export default class BaseForm extends React.Component {
  constructor(props, options = {}) {
    super(props);

    this.options = options;

    this.state = {
      // eslint-disable-next-line react/no-unused-state
      defaultValue: {},
      // eslint-disable-next-line react/no-unused-state
      formData: {},
      isSubmitting: false,
    };

    this.values = {};
    this.response = null;
    this.responseError = null;
    this.formRef = React.createRef();
    this.tipRef = React.createRef();
    this.codeError = false;
    this.currentFormValue = {};
    this.init();
  }

  componentDidMount() {
    try {
      // this.updateDefaultValue();
      this.updateState();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e);
    }
  }

  componentWillUnmount() {
    this.unsubscribe && this.unsubscribe();
    this.disposer && this.disposer();
    this.unMountActions && this.unMountActions();
  }

  get canSubmit() {
    return true;
  }

  get name() {
    return '';
  }

  get title() {
    return '';
  }

  get className() {
    return '';
  }

  get prefix() {
    return this.props.match.url;
  }

  get routing() {
    return this.props.rootStore.routing;
  }

  get params() {
    return this.props.match.params || {};
  }

  get location() {
    return this.props.location || {};
  }

  get locationParams() {
    return parse(this.location.search.slice(1));
  }

  get listUrl() {
    return '';
  }

  get isAdminPage() {
    const { pathname = '' } = this.props.location || {};
    return isAdminPage(pathname);
  }

  get hasAdminRole() {
    return this.props.rootStore.hasAdminRole;
  }

  get currentProjectId() {
    return globals.user.project.id;
  }

  get currentProjectName() {
    return globals.user.project.name;
  }

  getUrl(path, adminStr) {
    return this.isAdminPage ? `${path}${adminStr || '-admin'}` : path;
  }

  get isStep() {
    return false;
  }

  get isModal() {
    return false;
  }

  get labelCol() {
    return {
      xs: { span: 5 },
      sm: { span: 3 },
    };
  }

  get wrapperCol() {
    return {
      xs: { span: 10 },
      sm: { span: 8 },
    };
  }

  get defaultValue() {
    return null;
  }

  get formDefaultValue() {
    const { context = {} } = this.props;
    const { defaultValue } = this;
    return {
      ...defaultValue,
      ...context,
    };
  }

  get okBtnText() {
    return t('Confirm');
  }

  get instanceName() {
    const { name } = this.values || {};
    return name;
  }

  get successText() {
    return firstUpperCase(
      t('{action} successfully, instance: {name}.', {
        action: this.name.toLowerCase(),
        name: this.instanceName,
      })
    );
  }

  get errorText() {
    return t('Unable to {action}, instance: {name}.', {
      action: this.name.toLowerCase(),
      name: this.instanceName,
    });
  }

  get isSubmitting() {
    const { isSubmitting = false } = this.state;
    return isSubmitting;
    // return (this.store && this.store.isSubmitting) || false;
  }

  get formItems() {
    return [];
  }

  get validateMessages() {
    return [];
  }

  get tips() {
    return '';
  }

  get showNotice() {
    return true;
  }

  get nameForStateUpdate() {
    const typeList = ['radio', 'more'];
    return this.formItems
      .filter((it) => typeList.indexOf(it.type) >= 0)
      .map((it) => it.name);
  }

  updateContext = (allFields) => {
    const { updateContext } = this.props;
    updateContext && updateContext(allFields);
  };

  unescape = (message) => unescapeHtml(message);

  getFormInstance = () => this.formRef.current;

  // eslint-disable-next-line no-unused-vars
  onSubmit = (values) => Promise.resolve();

  updateSumbitting = (value) => {
    this.setState({
      isSubmitting: value || false,
    });
  };

  onOk = (values, containerProps, callback) => {
    // eslint-disable-next-line no-console
    console.log('onOk', values);
    this.values = values;
    if (this.codeError) {
      return;
    }
    this.updateSumbitting(true);
    if (!this.onSubmit) {
      return callback(true, false);
    }
    return this.onSubmit(values, containerProps).then(
      (response) => {
        this.updateSumbitting(false);
        !this.isModal && this.routing.push(this.listUrl);
        this.response = response;
        this.showNotice && Notify.success(this.successText);
        if (callback && isFunction(callback)) {
          callback(true, false);
        }
      },
      (err) => {
        this.updateSumbitting(false);
        this.responseError = err;
        this.showNotice && Notify.errorWithDetail(err, this.errorText);
        // eslint-disable-next-line no-console
        console.log(err);
        if (callback && isFunction(callback)) {
          callback(false, true);
        }
      }
    );
  };

  onCancel = () => {};

  getChangedFieldsValue = (changedFields, name) => {
    const value = changedFields[name];
    if (isObject(value) && value.value) {
      return value.value;
    }
    if (isObject(value) && value.selectedRows) {
      return value.selectedRows[0];
    }
    return value;
  };

  // eslint-disable-next-line no-unused-vars
  onValuesChange = (changedFields, allFields) => {};

  // eslint-disable-next-line no-unused-vars
  onValuesChangeForm = (changedFields, allFields) => {
    // save linkage data to state
    const newState = {};
    this.currentFormValue = allFields;
    this.nameForStateUpdate.forEach((name) => {
      if (has(changedFields, name)) {
        const value = this.getChangedFieldsValue(changedFields, name);
        newState[name] = value;
      }
    });
    if (!isEmpty(newState)) {
      this.setState({
        ...newState,
      });
    }
    this.onValuesChange(changedFields, allFields);
  };

  checkFormInput = (callback, failCallback) => {
    this.formRef.current &&
      this.formRef.current.validateFields().then(
        (values) => {
          callback && callback(values);
          this.updateContext(values);
        },
        ({ values, errorFields }) => {
          if (errorFields && errorFields.length) {
            failCallback && failCallback(values, errorFields);
          } else {
            // eslint-disable-next-line no-console
            console.log('checkFormInput-catch', values, errorFields);
            // callback && callback(values);
          }
        }
      );
  };

  onClickSubmit = (callback, checkCallback, containerProps) => {
    if (this.codeError) {
      return;
    }
    this.checkFormInput((values) => {
      checkCallback && checkCallback(values);
      this.onOk(values, containerProps, callback);
    });
  };

  onClickCancel = () => {
    this.routing.push(this.listUrl);
  };

  updateDefaultValue = () => {
    if (this.formRef.current && this.formRef.current.resetFields) {
      this.formRef.current.resetFields();
    }
    this.updateContext(this.defaultValue);
  };

  updateFormValue = (key, value) => {
    this.formRef.current &&
      this.formRef.current.setFieldsValue({
        [key]: value,
      });
  };

  updateState() {
    // save linkage data to state
    const { context } = this.props;
    const names = this.nameForStateUpdate;
    if (names.length === 0) {
      return;
    }
    const newState = {};
    if (this.checkContextValue()) {
      names.forEach((name) => {
        newState[name] = this.getChangedFieldsValue(context, name);
      });
    } else {
      names.forEach((name) => {
        newState[name] = this.getChangedFieldsValue(this.defaultValue, name);
      });
    }
    this.setState({
      ...newState,
    });
  }

  checkContextValue() {
    const { context } = this.props;
    const names = this.nameForStateUpdate;
    if (isEmpty(context)) {
      return false;
    }
    const item = names.find((name) => has(context, name));
    return !!item;
  }

  init() {
    this.store = {};
  }

  renderTips() {
    if (this.tips) {
      return (
        <div className={styles.tips} ref={this.tipRef}>
          <InfoCircleOutlined className={styles['tips-icon']} />
          {this.tips}
        </div>
      );
    }
    return null;
  }

  renderFooterLeft() {
    return null;
  }

  renderFooter() {
    if (this.isStep || this.isModal) {
      return null;
    }
    return (
      <div className={styles.footer}>
        <div className={styles['footer-left']}>{this.renderFooterLeft()}</div>
        <div className={classnames(styles.btns, 'footer-btns')}>
          <Button
            className={styles.cancel}
            onClick={this.onClickCancel}
            loading={this.isSubmitting}
          >
            {t('Cancel')}
          </Button>
          <Button
            disabled={!this.canSubmit}
            type="primary"
            className={styles.submit}
            onClick={this.onClickSubmit}
            loading={this.isSubmitting}
          >
            {this.okBtnText}
          </Button>
        </div>
      </div>
    );
  }

  renderFormItems() {
    try {
      return this.formItems.map((it, index) => {
        const { name } = it;
        this.codeError = false;
        return (
          <Col
            span={24 / (it.colNum || 1)}
            key={`form-item-col-${index}`}
            id={`form-item-col-${name}`}
          >
            <FormItem
              {...it}
              key={`form-item-${index}`}
              formRef={this.formRef}
            />
          </Col>
        );
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e);
      const name = 'error';
      const index = 0;
      const it = {
        type: 'label',
        label: t('Error'),
        // if can't submit, go this way to not submit.
        // example src/pages/network/containers/VPN/IKEPolicy/actions/Edit.js L60-71
        content:
          e.message === 'Can Not Submit'
            ? this.errorText
            : t('Unable to render form'),
      };
      this.codeError = true;
      return (
        <Col
          span={24 / (it.colNum || 1)}
          key={`form-item-col-${index}`}
          id={`form-item-col-${name}`}
        >
          <FormItem {...it} key={`form-item-${index}`} formRef={this.formRef} />
        </Col>
      );
      // return null;
    }
  }

  renderForms() {
    return (
      <Form
        ref={this.formRef}
        labelCol={this.labelCol}
        colon={false}
        labelAlign="left"
        wrapperCol={this.wrapperCol}
        name={this.name}
        // onFinish={this.onOk}
        initialValues={this.formDefaultValue}
        onValuesChange={this.onValuesChangeForm}
        scrollToFirstError
      >
        <Row>{this.renderFormItems()}</Row>
      </Form>
    );
  }

  render() {
    const wrapperPadding =
      this.listUrl || this.isStep || (this.isModal && this.tips)
        ? styles['wrapper-page-padding']
        : '';
    const tips = this.renderTips();
    const formStyle = {};
    if ((this.listUrl || this.isStep) && this.tips && this.tipRef.current) {
      if (this.isStep) {
        const tipHeight = this.tipRef.current.clientHeight + 219;
        formStyle.height = `calc(100vh - ${tipHeight}px)`;
      } else {
        const tipHeight = this.tipRef.current.clientHeight + 66;
        formStyle.height = `calc(100% - ${tipHeight}px)`;
      }
    }
    return (
      <div
        className={classnames(styles.wrapper, wrapperPadding, this.className)}
      >
        <Spin spinning={this.isSubmitting}>
          {tips}
          <div className={classnames(styles.form, 'sl-form')} style={formStyle}>
            {this.renderForms()}
          </div>
          {this.renderFooter()}
        </Spin>
      </div>
    );
  }
}
