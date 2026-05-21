// Copyright 2026 WIIT AG
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
import { inject, observer } from 'mobx-react';
import {
  Button,
  Input,
  Layout,
  Alert,
  Space,
  Spin,
  Typography,
  Popconfirm,
  message,
} from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, DeleteOutlined, PlusOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { QRCodeSVG } from 'qrcode.react';
import { TotpStore } from 'stores/keystone/totp';
import styles from './styles.less';

const { Title, Text, Paragraph } = Typography;

export class TOTPConfig extends Component {
  constructor(props) {
    super(props);
    this.store = new TotpStore();
    this._fetchId = 0;
    this.state = {
      credentials: [],
      isLoading: true,
      mfaEnabled: false,
      mfaLoading: false,
      pendingSeed: null,
      verifyCode: '',
      verifyLoading: false,
      verifyError: false,
    };
  }

  componentDidMount() {
    this.fetchCredentials();
  }

  componentDidUpdate(prevProps) {
    const prevId = prevProps.targetUserId || prevProps.rootStore?.user?.user?.id;
    const nextId = this.props.targetUserId || this.props.rootStore?.user?.user?.id;
    if (prevId !== nextId && nextId) {
      this._fetchId += 1;
      this.fetchCredentials();
    }
  }

  get userId() {
    const { targetUserId, rootStore: { user: { user: { id } = {} } = {} } = {} } = this.props;
    return targetUserId || id;
  }

  get username() {
    const { targetUsername, rootStore: { user: { user: { name } = {} } = {} } = {} } = this.props;
    return targetUsername || name || 'user';
  }

  get isAdmin() {
    const { isAdminView, rootStore: { hasAdminRole } = {} } = this.props;
    return isAdminView || !!hasAdminRole;
  }


  onStartSetup = () => {
    const seed = this.store.prepareSeed();
    this.setState({ pendingSeed: seed, verifyCode: '', verifyError: false });
  };

  onCancelSetup = () => {
    this.setState({ pendingSeed: null, verifyCode: '', verifyError: false });
  };

  onVerifyAndSave = async () => {
    const { pendingSeed, verifyCode } = this.state;
    this.setState({ verifyLoading: true, verifyError: false });
    try {
      const isValid = await verifyTotpCode(pendingSeed, verifyCode.trim());
      if (!isValid) {
        this.setState({ verifyLoading: false, verifyError: true });
        return;
      }
      await this.store.save(this.userId, pendingSeed);
      message.success(t('TOTP authenticator saved. It will be required at your next login.'));
      this.setState({ pendingSeed: null, verifyCode: '', verifyLoading: false });
      await this.fetchCredentials();
    } catch (e) {
      message.error(t('Failed to create TOTP credential.'));
      this.setState({ verifyLoading: false });
    }
  };

  onToggleMfa = async () => {
    const { mfaEnabled } = this.state;
    this.setState({ mfaLoading: true });
    try {
      if (mfaEnabled) {
        await this.store.disableMfa(this.userId);
        message.success(t('Two-factor authentication disabled.'));
      } else {
        await this.store.enableMfa(this.userId);
        message.success(t('Two-factor authentication enabled.'));
      }
      await this.fetchCredentials();
    } catch (e) {
      message.error(t('Failed to update MFA settings.'));
    } finally {
      this.setState({ mfaLoading: false });
    }
  };

  onDelete = async (credentialId) => {
    try {
      await this.store.deleteCredential(credentialId);
      message.success(t('TOTP credential deleted.'));
      await this.fetchCredentials();
    } catch (e) {
      message.error(t('Failed to delete TOTP credential.'));
    }
  };

  async fetchCredentials() {
    this._fetchId += 1;
    const fetchId = this._fetchId;
    this.setState({ isLoading: true });
    try {
      const [credentials, user] = await Promise.all([
        this.store.fetchList(this.userId),
        this.store.fetchUser(this.userId),
      ]);
      if (fetchId !== this._fetchId) return;
      const rules = user?.options?.multi_factor_auth_rules || [];
      const totpInRules = rules.some((rule) => Array.isArray(rule) && rule.includes('totp'));
      const mfaEnabled = user?.options?.multi_factor_auth_enabled === true && totpInRules;
      this.setState({ credentials, mfaEnabled, isLoading: false });
    } catch (e) {
      if (fetchId !== this._fetchId) return;
      this.setState({ isLoading: false });
      message.error(t('Failed to load TOTP credentials.'));
    }
  }

  renderQrSection() {
    const { pendingSeed, verifyCode, verifyLoading, verifyError } = this.state;

    if (!pendingSeed) {
      return (
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={this.onStartSetup}
        >
          {t('Add TOTP Authenticator')}
        </Button>
      );
    }

    const otpauthUrl = buildOtpauthUrl(pendingSeed, this.username);

    return (
      <div className={styles['totp-setup']}>
        <Alert
          type="warning"
          showIcon
          message={t('Save this QR code now — it will not be shown again.')}
          className={styles['verify-alert']}
        />
        <Title level={5} style={{ marginTop: 16 }}>
          {t('Scan this QR Code with your authenticator app')}
        </Title>
        <Paragraph type="secondary">
          {t('Use Google Authenticator, Authy, or any TOTP-compatible app.')}
        </Paragraph>
        <div className={styles['qr-wrapper']}>
          <QRCodeSVG value={otpauthUrl} size={200} level="M" />
        </div>
        <Paragraph>
          <Text type="secondary">{t('Or enter the secret manually:')}</Text>
          <br />
          <Text copyable code>{pendingSeed}</Text>
        </Paragraph>
        <div className={styles['verify-section']}>
          <Paragraph strong>
            {t('Enter the 6-digit code from your app to confirm setup:')}
          </Paragraph>
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <Input
              placeholder={t('TOTP Code')}
              maxLength={6}
              autoComplete="one-time-code"
              value={verifyCode}
              onChange={(e) => this.setState({ verifyCode: e.target.value.replace(/\D/g, ''), verifyError: false })}
              onPressEnter={verifyCode.length === 6 ? this.onVerifyAndSave : undefined}
              style={{ width: 160 }}
              status={verifyError ? 'error' : ''}
            />
            {verifyError && (
              <Text type="danger">{t('Invalid TOTP code. Please try again.')}</Text>
            )}
            <Space>
              <Button
                type="primary"
                icon={<SafetyCertificateOutlined />}
                loading={verifyLoading}
                disabled={verifyCode.length !== 6}
                onClick={this.onVerifyAndSave}
              >
                {t('Verify & Save')}
              </Button>
              <Button onClick={this.onCancelSetup}>
                {t('Cancel')}
              </Button>
            </Space>
          </Space>
        </div>
      </div>
    );
  }

  renderMfaStatus() {
    const { mfaEnabled, mfaLoading, credentials } = this.state;
    const hasCredential = credentials.length > 0;
    return (
      <div className={styles['mfa-status']}>
        <Space>
          {mfaEnabled
            ? <CheckCircleOutlined style={{ color: '#52c41a' }} />
            : <CloseCircleOutlined style={{ color: '#d2d2d2' }} />
          }
          <Text strong>
            {mfaEnabled
              ? t('Two-factor authentication is enabled')
              : t('Two-factor authentication is disabled')
            }
          </Text>
          {this.isAdmin ? (
            <Button
              size="small"
              type={mfaEnabled ? 'default' : 'primary'}
              danger={mfaEnabled}
              loading={mfaLoading}
              disabled={!hasCredential && !mfaEnabled}
              onClick={this.onToggleMfa}
            >
              {mfaEnabled ? t('Disable 2FA') : t('Enable 2FA')}
            </Button>
          ) : (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {t('Contact an administrator to enable or disable 2FA.')}
            </Text>
          )}
        </Space>
        {this.isAdmin && !hasCredential && !mfaEnabled && (
          <div style={{ marginTop: 8 }}>
            <Text type="secondary">{t('Add a TOTP authenticator before enabling 2FA.')}</Text>
          </div>
        )}
      </div>
    );
  }

  renderCredentialList() {
    const { credentials, mfaEnabled } = this.state;

    if (credentials.length === 0) {
      return (
        <Alert
          type="info"
          message={t('No TOTP authenticator configured.')}
          description={t('Click "Add TOTP Authenticator" to set up two-factor authentication.')}
          showIcon
          className={styles.alert}
        />
      );
    }

    return (
      <div className={styles['credential-list']}>
        <Title level={5}>{t('Active TOTP Authenticators')}</Title>
        {credentials.map((cred) => {
          const isLastWithMfa = mfaEnabled && credentials.length === 1;
          return (
            <div key={cred.id} className={styles['credential-item']}>
              <Space>
                <CheckCircleOutlined style={{ color: '#52c41a' }} />
                <Text>{t('TOTP Authenticator')}</Text>
                <Text type="secondary" className={styles['credential-id']}>
                  ({cred.id.substring(0, 8)}…)
                </Text>
                <Popconfirm
                  title={t('Delete this TOTP authenticator?')}
                  description={
                    isLastWithMfa
                      ? t('Disable 2FA before deleting the last authenticator.')
                      : t('You will need to set up TOTP again after deletion.')
                  }
                  onConfirm={isLastWithMfa ? undefined : () => this.onDelete(cred.id)}
                  okButtonProps={{ disabled: isLastWithMfa }}
                  okText={t('Delete')}
                  okType="danger"
                  cancelText={t('Cancel')}
                >
                  <Button type="text" danger icon={<DeleteOutlined />} size="small">
                    {t('Delete')}
                  </Button>
                </Popconfirm>
              </Space>
            </div>
          );
        })}
      </div>
    );
  }

  render() {
    const { isLoading } = this.state;

    return (
      <Layout.Content className={styles.content}>
        <div className={styles.card}>
          <Title level={4}>{t('Two-Factor Authentication (TOTP)')}</Title>
          <Paragraph>
            {t(
              'Time-based One-Time Passwords (TOTP) add an extra layer of security to your account. After entering your password, you will be prompted for a 6-digit code from your authenticator app.'
            )}
          </Paragraph>
          <Spin spinning={isLoading}>
            {this.renderMfaStatus()}
            {this.renderCredentialList()}
            <div className={styles['add-section']}>
              {this.renderQrSection()}
            </div>
          </Spin>
        </div>
      </Layout.Content>
    );
  }
}

function buildOtpauthUrl(seed, username) {
  const issuer = 'OpenStack';
  const label = encodeURIComponent(`${issuer}:${username}`);
  return `otpauth://totp/${label}?secret=${seed}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
}

function base32Decode(base32) {
  const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const str = base32.toUpperCase().replace(/=+$/, '');
  const bytes = [];
  for (let i = 0; i < str.length; i += 8) {
    const c = Array.from({ length: 8 }, (_, j) => {
      const ch = str[i + j] || 'A';
      const idx = CHARS.indexOf(ch);
      return idx === -1 ? 0 : idx;
    });
    bytes.push((c[0] * 8) + Math.floor(c[1] / 4));
    bytes.push(((c[1] % 4) * 64) + (c[2] * 2) + Math.floor(c[3] / 16));
    bytes.push(((c[3] % 16) * 16) + Math.floor(c[4] / 2));
    bytes.push(((c[4] % 2) * 128) + (c[5] * 4) + Math.floor(c[6] / 8));
    bytes.push(((c[6] % 8) * 32) + c[7]);
  }
  return new Uint8Array(bytes);
}

async function verifyTotpCode(seed, code) {
  if (!code || code.length !== 6) return false;
  const keyBytes = base32Decode(seed);
  const cryptoKey = await crypto.subtle.importKey(
    'raw', keyBytes, { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']
  );
  const now = Math.floor(Date.now() / 1000 / 30);
  const otps = await Promise.all(
    [now - 1, now, now + 1].map(async (counter) => {
      const buf = new ArrayBuffer(8);
      const view = new DataView(buf);
      view.setUint32(4, counter, false);
      const sig = await crypto.subtle.sign('HMAC', cryptoKey, buf);
      const hmac = new Uint8Array(sig);
      const offset = hmac[19] % 16;
      const p = new DataView(hmac.buffer, offset, 4);
      return String((p.getUint32(0) % 2147483648) % 1000000).padStart(6, '0');
    })
  );
  return otps.includes(code);
}

export default inject('rootStore')(observer(TOTPConfig));
