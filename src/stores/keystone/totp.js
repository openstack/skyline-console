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

import { action, observable } from 'mobx';
import client from 'client';

function generateTotpSeed() {
  const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  const view = new DataView(bytes.buffer);
  let output = '';
  for (let i = 0; i < bytes.length; i += 5) {
    const b = [
      i < bytes.length ? view.getUint8(i) : 0,
      i + 1 < bytes.length ? view.getUint8(i + 1) : 0,
      i + 2 < bytes.length ? view.getUint8(i + 2) : 0,
      i + 3 < bytes.length ? view.getUint8(i + 3) : 0,
      i + 4 < bytes.length ? view.getUint8(i + 4) : 0,
    ];
    output += BASE32_CHARS[Math.floor(b[0] / 8)];
    output += BASE32_CHARS[((b[0] % 8) * 4) + Math.floor(b[1] / 64)];
    output += BASE32_CHARS[Math.floor(b[1] / 2) % 32];
    output += BASE32_CHARS[((b[1] % 2) * 16) + Math.floor(b[2] / 16)];
    output += BASE32_CHARS[((b[2] % 16) * 2) + Math.floor(b[3] / 128)];
    output += BASE32_CHARS[Math.floor(b[3] / 4) % 32];
    output += BASE32_CHARS[((b[3] % 4) * 8) + Math.floor(b[4] / 32)];
    output += BASE32_CHARS[b[4] % 32];
  }
  return output;
}

export class TotpStore {
  @observable
  credentials = [];

  @observable
  isLoading = false;

  get client() {
    return client.keystone.totpCredentials;
  }

  get usersClient() {
    return client.keystone.users;
  }

  @action
  async fetchList(userId) {
    this.isLoading = true;
    try {
      const result = await this.client.list({ type: 'totp', user_id: userId });
      this.credentials = result.credentials || [];
    } finally {
      this.isLoading = false;
    }
    return this.credentials;
  }

  prepareSeed() {
    return generateTotpSeed();
  }

  @action
  async fetchUser(userId) {
    const result = await this.usersClient.show(userId);
    return result.user;
  }

  @action
  async enableMfa(userId) {
    await this.usersClient.patch(userId, {
      user: {
        options: {
          multi_factor_auth_enabled: true,
          multi_factor_auth_rules: [['password', 'totp'], ['application_credential']],
        },
      },
    });
  }

  @action
  async disableMfa(userId) {
    await this.usersClient.patch(userId, {
      user: {
        options: {
          multi_factor_auth_enabled: false,
          multi_factor_auth_rules: [],
        },
      },
    });
  }

  @action
  async save(userId, seed) {
    const body = {
      credential: {
        type: 'totp',
        user_id: userId,
        blob: seed,
      },
    };
    const result = await this.client.create(body);
    return result.credential;
  }

  @action
  async deleteCredential(credentialId) {
    await this.client.delete(credentialId);
    this.credentials = this.credentials.filter((c) => c.id !== credentialId);
  }

}
