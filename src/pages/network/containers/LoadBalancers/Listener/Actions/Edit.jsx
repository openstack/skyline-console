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

import { inject, observer } from 'mobx-react';
import globalListenerStore from 'stores/octavia/listener';
import globalLbaasStore from 'stores/octavia/loadbalancer';
import {
  getInsertHeadersFormValueFromListener,
  getInsertHeadersValueFromForm,
} from 'resources/octavia/lb';
import { Create as Base } from './CreateListener';

export class Edit extends Base {
  static id = 'edit-listener';

  static title = t('Edit Listener');

  static buttonText = t('Edit');

  static policy = 'os_load-balancer_api:listener:put';

  static allowed = async (item, containerProps) => {
    const { detail } = containerProps || {};
    let lbDetail = item.loadBalancer || detail;
    if (!lbDetail) {
      lbDetail = await globalLbaasStore.pureFetchDetail(item.loadbalancers[0]);
    }
    return Promise.resolve(
      item.provisioning_status === 'ACTIVE' &&
        lbDetail.provisioning_status === 'ACTIVE'
    );
  };

  get name() {
    return t('Edit Listener');
  }

  get isEdit() {
    return true;
  }

  get defaultValue() {
    const { item } = this.props;
    const {
      name,
      description,
      protocol,
      protocol_port,
      connection_limit,
      admin_state_up,
    } = item || {};
    const values = {
      name,
      description,
      protocol,
      protocol_port,
      connection_limit,
      insert_headers: getInsertHeadersFormValueFromListener(item),
      admin_state_up,
    };
    if (item.protocol === 'TERMINATED_HTTPS') {
      if (item.default_tls_container_ref) {
        const [, uuid] = item.default_tls_container_ref.split('/containers/');
        values.default_tls_container_ref = {
          selectedRowKeys: [uuid],
          selectedRows: this.ServerCertificate.filter((it) => it.id === uuid),
        };
      }
      if (item.client_ca_tls_container_ref) {
        const [, uuid] = item.client_ca_tls_container_ref.split('/secrets/');
        values.ssl_parsing_method = 'two-way';
        values.client_ca_tls_container_ref = {
          selectedRowKeys: [uuid],
          selectedRows: this.CaCertificate.filter((it) => it.id === uuid),
        };
      } else {
        values.ssl_parsing_method = 'one-way';
      }
      if (item.sni_container_refs && item.sni_container_refs.length) {
        values.sni_enabled = true;
        const selectedKeys = item.sni_container_refs.map((it) => {
          const [, uuid] = it.split('/containers/');
          return uuid;
        });
        values.sni_container_refs = {
          selectedRowKeys: selectedKeys,
          selectedRows: this.SNICertificate.filter((it) => {
            return selectedKeys.includes(it.id);
          }),
        };
      } else {
        values.sni_enabled = false;
      }
    }
    return values;
  }

  get formItems() {
    const baseItems = super.formItems;
    return baseItems.map((it) => {
      if (it.name === 'sni_enabled') {
        it.disabled =
          this.item.sni_container_refs && this.item.sni_container_refs.length;
        it.tip = t(
          'If the listener has an SNI certificate installed, it cannot be removed. Please delete the listener or replace the SNI certificate'
        );
      }
      return it;
    });
  }

  onSubmit = (values) => {
    const { id } = this.item;
    const {
      protocol,
      protocol_port,
      sni_enabled,
      ssl_parsing_method,
      default_tls_container_ref,
      client_ca_tls_container_ref,
      sni_container_refs,
      insert_headers,
      ...rest
    } = values;
    const data = {
      ...rest,
    };
    const insertHeaders = getInsertHeadersValueFromForm(insert_headers);
    if (insertHeaders) {
      data.insert_headers = insertHeaders;
    } else {
      data.insert_headers = {};
    }
    if (protocol === 'TERMINATED_HTTPS') {
      if (default_tls_container_ref) {
        data.default_tls_container_ref =
          default_tls_container_ref.selectedRows[0].container_ref;
      }
      if (ssl_parsing_method === 'two-way' && client_ca_tls_container_ref) {
        data.client_ca_tls_container_ref =
          client_ca_tls_container_ref.selectedRows[0].secret_ref;
        data.client_authentication = 'MANDATORY';
      } else {
        data.client_ca_tls_container_ref = null;
        data.client_authentication = 'NONE';
      }
      if (sni_enabled && sni_container_refs) {
        data.sni_container_refs = sni_container_refs.selectedRows.map(
          (it) => it.container_ref
        );
      } else {
        data.sni_container_refs = [];
      }
    }
    return globalListenerStore.edit({ id }, data);
  };
}

export default inject('rootStore')(observer(Edit));
