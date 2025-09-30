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
import { Row, Col, Form, Button, Spin, Progress } from 'antd';
import classnames from 'classnames';
import { InfoCircleOutlined } from '@ant-design/icons';
import { isAdminPage, firstUpperCase, unescapeHtml } from 'utils/index';
import { parse } from 'qs';
import FormItem from 'components/FormItem';
import { CancelToken } from 'axios';
import { getPath, getLinkRender } from 'utils/route-map';
import InfoButton from 'components/InfoButton';
import QuotaChart from 'components/QuotaChart';
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
      percent: '',
    };

    this.values = {};
    this.response = null;
    this.responseError = null;
    this.formRef = React.createRef();
    this.tipRef = React.createRef();
    this.codeError = false;
    this.currentFormValue = {};
    this.cancel = null;
    this.cancelToken = this.hasRequestCancelCallback
      ? new CancelToken((c) => {
          this.cancel = c;
        })
      : null;
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

  get path() {
    const { location: { pathname = '' } = {} } = this.props;
    return pathname || '';
  }

  get disableSubmit() {
    return false;
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

  get currentUser() {
    const { user } = this.props.rootStore || {};
    return user || {};
  }

  get isAdminPage() {
    const { pathname = '' } = this.props.location || {};
    return isAdminPage(pathname);
  }

  get hasAdminRole() {
    return this.props.rootStore.hasAdminRole;
  }

  get currentProjectId() {
    return this.props.rootStore.projectId;
  }

  get currentProjectName() {
    return this.props.rootStore.projectName;
  }

  getRouteName(routeName) {
    return this.isAdminPage ? `${routeName}Admin` : routeName;
  }

  getRoutePath(routeName, params = {}, query = {}) {
    const realName = this.getRouteName(routeName);
    return getPath({ key: realName, params, query });
  }

  getLinkRender(routeName, value, params = {}, query = {}) {
    const realName = this.getRouteName(routeName);
    return getLinkRender({ key: realName, params, query, value });
  }

  get isStep() {
    return false;
  }

  get isModal() {
    return false;
  }

  get hasFooter() {
    return !(this.isStep || this.isModal);
  }

  get formStyle() {
    return {};
  }

  get footerStyle() {
    return {};
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
    if (this.instanceName) {
      return firstUpperCase(
        t('{action} successfully, instance: {name}.', {
          action: this.name.toLowerCase(),
          name: this.instanceName,
        })
      );
    }
    return firstUpperCase(
      t('{action} successfully.', {
        action: this.name.toLowerCase(),
      })
    );
  }

  get errorText() {
    if (this.instanceName) {
      return t('Unable to {action}, instance: {name}.', {
        action: this.name.toLowerCase(),
        name: this.instanceName,
      });
    }
    return t('Unable to {action}.', {
      action: this.name.toLowerCase(),
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

  get hasRequestCancelCallback() {
    return false;
  }

  get showQuota() {
    return false;
  }

  get quotaInfo() {
    return null;
  }

  get progressType() {
    return 'upload';
  }

  getRightExtraSpan() {
    return {
      left: 18,
      right: 6,
    };
  }

  getSubmitData(data) {
    return { ...data };
  }

  updateContext = (allFields) => {
    const { updateContext } = this.props;
    updateContext && updateContext(allFields);
  };

  unescape = (message) => unescapeHtml(message);

  getFormInstance = () => this.formRef.current;

  // eslint-disable-next-line no-unused-vars
  onSubmit = (values) => Promise.resolve();

  updateSubmitting = (value) => {
    this.setState({
      isSubmitting: value || false,
    });
  };

  onOk = (values, containerProps, callback) => {
    // eslint-disable-next-line no-console
    this.values = values;
    if (this.codeError) {
      return;
    }
    this.updateSubmitting(true);
    if (!this.onSubmit) {
      return callback(true, false);
    }
    const submitData = this.getSubmitData(values);
    return this.onSubmit(submitData, containerProps).then(
      (response) => {
        this.updateSubmitting(false);
        !this.isModal && this.routing.push(this.listUrl);
        this.response = response;
        if (callback && isFunction(callback)) {
          callback(true, false);
        }
        if (response instanceof Array) {
          const instanceNameArr = this.instanceName
            ? this.instanceName.split(', ')
            : null;
          const failedNames = response
            .map((it, idx) => {
              if (it.status === 'rejected') {
                return {
                  reason: it.reason,
                  name: instanceNameArr ? instanceNameArr[idx] : '',
                };
              }
              return null;
            })
            .filter((it) => !!it);
          if (failedNames.length !== 0) {
            failedNames.forEach((it) => {
              const { response: { data } = {} } = it.reason;
              this.showNotice &&
                Notify.errorWithDetail(
                  data,
                  t('Unable to {action}, instance: {name}.', {
                    action: this.name.toLowerCase(),
                    name: it.name,
                  })
                );
            });
          } else {
            this.showNotice && Notify.success(this.successText);
          }
        } else {
          this.showNotice && Notify.success(this.successText);
        }
      },
      (err = {}) => {
        this.updateSubmitting(false);
        this.responseError = err;
        const { response: { data } = {} } = err;
        this.showNotice && Notify.errorWithDetail(data, this.errorText);
        // eslint-disable-next-line no-console
        console.log('err', err, data);
        if (callback && isFunction(callback)) {
          callback(false, true);
        }
      }
    );
  };

  onCancel = () => {
    if (this.isSubmitting && this.cancel) {
      this.cancel();
      const message =
        this.progressType === 'download'
          ? t('Cancel download successfully.')
          : t('Cancel upload successfully.');
      Notify.success(message);
    }
  };

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
    this.onCancel();
    if (this.listUrl) {
      this.routing.push(this.listUrl);
    }
  };

  updateDefaultValue = () => {
    this.resetFormValue();
    this.updateContext(this.defaultValue);
  };

  resetFormValue = (fields) => {
    if (this.formRef.current && this.formRef.current.resetFields) {
      if (!fields) {
        this.formRef.current.resetFields();
      } else {
        this.formRef.current.resetFields(fields);
      }
    }
  };

  updateFormValue = (key, value) => {
    this.formRef.current &&
      this.formRef.current.setFieldsValue({
        [key]: value,
      });
  };

  onUploadProgress = (progressEvent) => {
    const { loaded, total } = progressEvent;
    const percent = Math.floor((loaded / total) * 100);
    this.setState({
      percent,
    });
  };

  getUploadRequestConf = () => {
    return {
      onUploadProgress: this.onUploadProgress,
      cancelToken: this.cancelToken,
    };
  };

  onDownloadProgress = (progressEvent) => {
    const { loaded, total } = progressEvent;
    const percent = Math.floor((loaded / total) * 100);
    this.setState({
      percent,
    });
  };

  getDownloadRequestConf = () => {
    return {
      onDownloadProgress: this.onDownloadProgress,
      cancelToken: this.cancelToken,
    };
  };

  checkContextValue() {
    const { context } = this.props;
    const names = this.nameForStateUpdate;
    if (isEmpty(context)) {
      return false;
    }
    const item = names.find((name) => has(context, name));
    return !!item;
  }

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

  init() {
    this.store = {};
  }

  renderTips() {
    if (this.tips) {
      return (
        <div className={styles.tips} ref={this.tipRef} id="tips">
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
    if (!this.hasFooter) {
      return null;
    }
    const footerStyle = {};
    if (this.tips) {
      const height =
        ((document.getElementById('tips') || {}).clientHeight || 35) + 16;
      footerStyle.bottom = height;
    }
    return (
      <div
        className={styles.footer}
        style={{ ...footerStyle, ...this.footerStyle }}
      >
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
            disabled={this.disableSubmit}
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
        const { name, display = true, ...rest } = it;
        if (!display) {
          return '';
        }
        this.codeError = false;
        return (
          <Col
            span={24 / (it.colNum || 1)}
            key={`form-item-col-${index}`}
            id={`form-item-col-${name}`}
          >
            <FormItem
              {...rest}
              name={name}
              key={`form-item-${index}`}
              formref={this.formRef}
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
          <FormItem {...it} key={`form-item-${index}`} formref={this.formRef} />
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
        <input type="password" hidden autoComplete="new-password" />
        <Row>{this.renderFormItems()}</Row>
      </Form>
    );
  }

  renderAbortButton() {
    if (!this.isSubmitting || this.isModal) {
      return null;
    }
    return (
      <Button className={styles.cancel} onClick={this.onClickCancel}>
        {t('Abort Upload')}
      </Button>
    );
  }

  renderSubmittingTip() {
    if (!this.hasRequestCancelCallback) {
      return;
    }
    const { percent } = this.state;
    const message =
      this.progressType === 'download'
        ? t('Download progress')
        : t('Upload progress');
    return (
      <div className={styles['submit-tip']}>
        {message}
        <div className={styles['progress-wrapper']}>
          <Progress percent={percent} size="small" />
        </div>
        {this.renderAbortButton()}
      </div>
    );
  }

  renderQuota() {
    if (!this.showQuota) {
      return null;
    }
    let props = {};
    if (!this.quotaInfo || !this.quotaInfo.length) {
      props.loading = true;
    } else {
      props = {
        loading: false,
        quotas: this.quotaInfo,
      };
    }
    return <QuotaChart {...props} />;
  }

  renderRightTopExtra() {
    if (this.isModal) {
      return null;
    }
    const content = this.renderQuota();
    if (!content) {
      return null;
    }
    const checkValue = JSON.stringify(this.quotaInfo);
    return (
      <div className={styles['right-top-extra-wrapper']}>
        <InfoButton content={content} checkValue={checkValue} />
      </div>
    );
  }

  renderModalRightExtra() {
    if (!this.isModal) {
      return null;
    }
    const content = this.renderQuota();
    if (!content) {
      return null;
    }
    return <div className={styles['modal-right-extra-wrapper']}>{content}</div>;
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

    const formDiv = (
      <Spin spinning={this.isSubmitting} tip={this.renderSubmittingTip()}>
        {this.renderRightTopExtra()}
        <div
          className={classnames(styles.form, 'sl-form')}
          style={{ ...formStyle, ...this.formStyle }}
        >
          {this.renderForms()}
        </div>
        {this.renderFooter()}
      </Spin>
    );
    const onlyForm = !this.isModal || (this.isModal && !this.showQuota);
    const { left, right } = this.getRightExtraSpan();
    const modalInner =
      this.isModal && !onlyForm ? (
        <Row justify="space-between" align="top">
          <Col span={left}>{formDiv}</Col>
          <Col span={right}>{this.renderModalRightExtra()}</Col>
        </Row>
      ) : null;
    return (
      <div
        className={classnames(styles.wrapper, wrapperPadding, this.className)}
      >
        {tips}
        {onlyForm && formDiv}
        {modalInner}
      </div>
    );
  }
}
