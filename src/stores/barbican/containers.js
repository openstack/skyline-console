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

import Base from 'stores/base';
import client from 'client';
import { action } from 'mobx';
import { SecretsStore } from './secrets';
import globalListenerStore from '../octavia/listener';

export class ContainersStore extends Base {
  get client() {
    return client.barbican.containers;
  }

  get payloadClient() {
    return client.barbican.secrets.payload;
  }

  get fetchListByLimit() {
    return true;
  }

  get secretStore() {
    // Not globalSecretsStore here
    return new SecretsStore();
  }

  updateMarkerParams = (limit, offset) => ({
    limit,
    offset,
  });

  get mapper() {
    return (data) => {
      const { container_ref, algorithm } = data;
      const [, uuid] = container_ref.split('/containers/');
      const { domain, expiration } = algorithm ? JSON.parse(algorithm) : {};
      return {
        ...data,
        id: uuid,
        domain,
        expiration,
      };
    };
  }

  async requestListAllByLimit(params, limit) {
    let hasNext = true;
    let data = [];
    while (hasNext) {
      const offset = data.length || '';
      // eslint-disable-next-line no-await-in-loop
      const result = await this.requestListByMarker(params, limit, offset);
      const items = this.getListDataFromResult(result);
      data = [...data, ...items];
      if (limit >= result.total || offset >= result.total) {
        hasNext = false;
      }
    }
    return data;
  }

  updateItem(item, listeners) {
    const { container_ref } = item;
    const enabledLs = listeners.filter((ls) => {
      const refs = [
        ls.default_tls_container_ref,
        ls.client_ca_tls_container_ref,
        ...ls.sni_container_refs,
      ];
      return refs.includes(container_ref);
    });
    if (enabledLs.length) {
      item.listener = enabledLs.map((ls) => ({
        id: ls.id,
        name: ls.name,
        lb: ls.lbIds[0],
      }));
    }
    return item;
  }

  async listDidFetch(items) {
    if (items.length === 0) return items;
    const [secrets, listeners] = await Promise.all([
      this.secretStore.fetchList({ mode: 'SERVER' }),
      globalListenerStore.fetchList(),
    ]);
    const newItems = items.map((it) => {
      const { secret_refs = [] } = it;
      if (secret_refs.length === 0) {
        it.hidden = true;
      } else {
        // Filter available secrets
        secret_refs.forEach((secret) => {
          const { secret_ref = '' } = secret;
          const [, secretId] = secret_ref.split('/secrets/');
          const theSecret = secrets.find((s) => s.id === secretId);
          if (theSecret) {
            Object.assign(secret, { secret_info: theSecret });
            Object.assign(it, {
              algorithm: theSecret.algorithm,
              mode: theSecret.mode,
            });
          } else {
            it.hidden = true;
          }
        });
        // Determine if the certificate is used in the listener
        this.updateItem(it, listeners);
      }
      return {
        ...it,
      };
    });
    return newItems.filter((it) => it.hidden !== true);
  }

  async detailDidFetch(item) {
    const { secret_refs = [] } = item;
    const [secrets, listeners] = await Promise.all([
      this.secretStore.fetchList({ mode: 'SERVER' }),
      globalListenerStore.fetchList(),
    ]);
    const secretIds = [];
    // Filter available secrets
    secret_refs.forEach(async (secret) => {
      const { secret_ref = '' } = secret;
      const [, secretId] = secret_ref.split('/secrets/');
      const theSecret = secrets.find((s) => s.id === secretId);
      if (theSecret) {
        secretIds.push(theSecret.id);
        Object.assign(secret, { secret_info: theSecret });
        Object.assign(item, {
          algorithm: theSecret.algorithm,
          mode: theSecret.mode,
        });
      }
    });
    // Determine if the certificate is used in the listener
    this.updateItem(item, listeners);
    // Fetch secrets payload with proper decoding
    const payloads = await Promise.all(
      secretIds.map(async (id) => {
        try {
          const payload = await this.payloadClient.list(id, null, {
            headers: {
              Accept: '*/*',
            },
            responseType: 'arraybuffer',
          });

          // Decode payload if it's binary
          if (payload instanceof ArrayBuffer) {
            const bytes = new Uint8Array(payload);

            // Check if it's actually text by trying to decode it
            const textDecoder = new TextDecoder('utf-8', { fatal: false });
            const decodedText = textDecoder.decode(bytes);

            // Check if the decoded text contains valid printable characters
            const isValidText = /^[\x20-\x7E\n\r\t]*$/.test(decodedText);

            if (isValidText) {
              // It's valid text, use it
              return decodedText;
            }
            // It's binary data, convert to base64
            let binary = '';
            for (let i = 0; i < bytes.byteLength; i++) {
              binary += String.fromCharCode(bytes[i]);
            }
            return btoa(binary);
          }
          return payload;
        } catch (error) {
          console.error(`Failed to fetch payload for secret ${id}:`, error);
          return null;
        }
      })
    );
    (payloads || []).forEach((it, index) => {
      secret_refs[index].secret_info.payload = it;
    });
    return item;
  }

  @action
  async create(values) {
    // Create Secret
    const commonData = {
      name: values.name,
      mode: values.mode,
      payload_content_type: 'text/plain',
      secret_type: 'certificate',
      algorithm: JSON.stringify({
        domain: values.domain,
        expiration: values.expiration,
      }),
    };
    const contentData = {
      ...commonData,
      payload: values.certificate,
    };
    const createSecretArr = [this.secretStore.create(contentData)];
    if (values.mode === 'SERVER') {
      const privateKeyData = {
        ...commonData,
        payload: values.private_key,
      };
      createSecretArr.push(this.secretStore.create(privateKeyData));
    }
    const [content, privateKey] = await Promise.all(createSecretArr);
    // Create Containers
    const secretRefs = [
      {
        name: 'certificate',
        secret_ref: content.secret_ref,
      },
    ];
    if (privateKey) {
      secretRefs.push({
        name: 'private_key',
        secret_ref: privateKey.secret_ref,
      });
    }
    const data = {
      type: 'certificate',
      name: values.name,
      secret_refs: secretRefs,
    };
    return this.client.create(data);
  }

  @action
  delete = async (data) => {
    const { id, secret_refs = [] } = data;
    await Promise.all(
      secret_refs.map((it) => {
        const { secret_ref = '' } = it;
        const [, secretId] = secret_ref.split('/secrets/');
        return this.secretStore.delete({ id: secretId });
      })
    );
    return this.submitting(this.client.delete(id));
  };
}

const globalContainersStore = new ContainersStore();
export default globalContainersStore;
