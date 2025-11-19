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
import globalListenerStore from '../octavia/listener';

export class SecretsStore extends Base {
  get client() {
    return client.barbican.secrets;
  }

  get payloadClient() {
    return client.barbican.secrets.payload;
  }

  get fetchListByLimit() {
    return true;
  }

  get paramsFunc() {
    return (params) => ({
      ...params,
    });
  }

  updateMarkerParams = (limit, offset) => ({
    limit,
    offset,
  });

  get mapper() {
    return (data) => {
      const { secret_ref, algorithm, expiration } = data;
      const [, uuid] = secret_ref.split('/secrets/');
      let extractedExpiration = expiration;
      if (algorithm && algorithm.startsWith('{')) {
        try {
          const parsed = JSON.parse(algorithm);
          extractedExpiration = parsed.expiration || expiration;
        } catch {
          // Do nothing, Keep original expiration if parsing fails
        }
      }
      return {
        ...data,
        id: uuid,
        expiration: extractedExpiration,
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
    const { secret_ref } = item;
    const enabledLs = listeners.filter((ls) => {
      const refs = [
        ls.default_tls_container_ref,
        ls.client_ca_tls_container_ref,
        ...ls.sni_container_refs,
      ];
      return refs.includes(secret_ref);
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

  @action
  async fetchDetail({ id, silent }) {
    if (!silent) {
      this.isLoading = true;
    }
    const [item, payload] = await Promise.all([
      this.client.show(id, null, {
        headers: {
          Accept: 'application/json',
        },
      }),
      this.payloadClient.list(id, null, {
        headers: {
          Accept: '*/*',
        },
        responseType: 'arraybuffer',
      }),
    ]);

    let listeners = [];
    try {
      listeners = await globalListenerStore.fetchList();
    } catch (e) {
      listeners = [];
    }

    let decodedPayload = payload;
    if (payload) {
      try {
        if (payload instanceof ArrayBuffer) {
          const bytes = new Uint8Array(payload);
          const contentType = item.payload_content_type || 'text/plain';

          const textDecoder = new TextDecoder('utf-8', { fatal: false });
          const decodedText = textDecoder.decode(bytes);

          const isValidText = /^[\x20-\x7E\n\r\t]*$/.test(decodedText);

          if (
            isValidText &&
            (contentType.includes('text') ||
              contentType.includes('plain') ||
              contentType.includes('json'))
          ) {
            decodedPayload = decodedText;
          } else {
            let binary = '';
            for (let i = 0; i < bytes.byteLength; i++) {
              binary += String.fromCharCode(bytes[i]);
            }
            decodedPayload = btoa(binary);
          }
        } else if (typeof payload === 'string') {
          decodedPayload = payload;
        } else {
          decodedPayload = JSON.stringify(payload, null, 2);
        }
      } catch (error) {
        console.error('Error decoding payload:', error);
        decodedPayload = 'Error decoding payload';
      }
    }

    item.payload = decodedPayload;
    // Determine if the certificate is used in the listener
    this.updateItem(item, listeners);
    const detail = this.mapper(item || {});
    this.detail = detail;
    this.isLoading = false;
    return detail;
  }

  async listDidFetch(items) {
    if (items.length === 0) return items;
    let listeners = [];
    try {
      listeners = await globalListenerStore.fetchList();
    } catch (e) {
      listeners = [];
    }
    return items.map((it) => {
      // Determine if the certificate is used in the listener
      this.updateItem(it, listeners);
      return {
        ...it,
      };
    });
  }

  @action
  async create(data) {
    const {
      expiration,
      secret_type,
      algorithm,
      bit_length,
      mode,
      payload_content_encoding,
      ...rest
    } = data;

    const body = {
      ...rest,
      ...(secret_type && secret_type.trim() !== '' && { secret_type }),
      ...(algorithm && algorithm.trim() !== '' && { algorithm }),
      ...(bit_length && { bit_length }),
      ...(mode && mode.trim() !== '' && { mode }),
      ...(payload_content_encoding &&
        payload_content_encoding.trim() !== '' && { payload_content_encoding }),
      ...(expiration && { expiration }),
    };
    return this.client.create(body);
  }
}

const globalSecretsStore = new SecretsStore();
export default globalSecretsStore;
