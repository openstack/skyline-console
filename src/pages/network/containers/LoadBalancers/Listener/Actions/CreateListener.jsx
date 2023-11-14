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
import { ModalAction } from 'containers/Action';
import { ListenerStore } from 'stores/octavia/listener';
import { ContainersStore } from 'stores/barbican/containers';
import { SecretsStore } from 'stores/barbican/secrets';
import {
  getCertificateColumns,
  getInsertHeadersValueFromForm,
  getListenerInsertHeadersFormItem,
  listenerProtocols,
  sslParseMethod,
} from 'resources/octavia/lb';

export class Create extends ModalAction {
  static id = 'create_listener';

  static title = t('Create Listener');

  policy = () => 'os_load-balancer_api:listener:post';

  get name() {
    return t('Create Listener');
  }

  static policy = 'os_load-balancer_api:listener:post';

  static get modalSize() {
    return 'large';
  }

  getModalSize() {
    return 'large';
  }

  static allowed = (item) =>
    Promise.resolve(item.provisioning_status === 'ACTIVE');

  init() {
    this.store = new ListenerStore();
    this.containersStore = new ContainersStore();
    this.secretsStore = new SecretsStore();
    this.fetchContainers();
    this.fetchSecrets();
  }

  async fetchContainers() {
    await this.containersStore.fetchList();
    this.updateDefaultValue();
  }

  async fetchSecrets() {
    await this.secretsStore.fetchList({ mode: 'CA' });
    this.updateDefaultValue();
  }

  get ServerCertificate() {
    return this.containersStore.list.data || [];
  }

  get CaCertificate() {
    return this.secretsStore.list.data || [];
  }

  get SNICertificate() {
    return (this.containersStore.list.data || []).filter((it) => !!it.domain);
  }

  get isEdit() {
    return false;
  }

  get nameForStateUpdate() {
    return ['protocol', 'ssl_parsing_method', 'sni_enabled'];
  }

  get defaultValue() {
    return {
      ssl_parsing_method: 'one-way',
      sni_enabled: false,
      connection_limit: -1,
      admin_state_up: true,
    };
  }

  get formItems() {
    const { protocol, ssl_parsing_method, sni_enabled } = this.state;

    const insertHeaderFormItem = getListenerInsertHeadersFormItem();

    return [
      {
        name: 'name',
        label: t('Name'),
        type: 'input-name',
        required: true,
      },
      {
        name: 'description',
        label: t('Description'),
        type: 'textarea',
      },
      {
        name: 'protocol',
        label: t('Protocol'),
        type: 'select',
        options: listenerProtocols,
        required: true,
        disabled: this.isEdit,
      },
      {
        name: 'ssl_parsing_method',
        label: t('SSL Parsing Method'),
        type: 'select',
        options: sslParseMethod,
        required: true,
        display: protocol === 'TERMINATED_HTTPS',
      },
      {
        name: 'default_tls_container_ref',
        label: t('Server Certificate'),
        type: 'select-table',
        required: true,
        data: this.ServerCertificate,
        isLoading: this.containersStore.list.isLoading,
        isMulti: false,
        filterParams: [
          {
            label: t('Name'),
            name: 'name',
          },
        ],
        columns: getCertificateColumns(this),
        display: protocol === 'TERMINATED_HTTPS',
      },
      {
        name: 'client_ca_tls_container_ref',
        label: t('CA Certificate'),
        type: 'select-table',
        required: true,
        data: this.CaCertificate,
        isLoading: this.secretsStore.list.isLoading,
        isMulti: false,
        filterParams: [
          {
            label: t('Name'),
            name: 'name',
          },
        ],
        columns: getCertificateColumns(this).filter(
          (it) => it.dataIndex !== 'domain'
        ),
        display:
          protocol === 'TERMINATED_HTTPS' && ssl_parsing_method === 'two-way',
      },
      {
        name: 'sni_enabled',
        label: t('SNI Enabled'),
        type: 'switch',
        display: protocol === 'TERMINATED_HTTPS',
      },
      {
        name: 'sni_container_refs',
        label: t('SNI Certificate'),
        type: 'select-table',
        required: true,
        data: this.SNICertificate,
        isLoading: this.containersStore.list.isLoading,
        isMulti: true,
        filterParams: [
          {
            label: t('Name'),
            name: 'name',
          },
        ],
        columns: getCertificateColumns(this),
        display: protocol === 'TERMINATED_HTTPS' && sni_enabled,
      },
      {
        name: 'protocol_port',
        label: t('Port'),
        type: 'input-number',
        required: true,
        disabled: this.isEdit,
      },
      {
        name: 'connection_limit',
        label: t('Connection Limit'),
        type: 'input-number',
        min: -1,
        extra: t('-1 means no connection limit'),
        required: true,
      },
      {
        name: 'admin_state_up',
        label: t('Admin State Up'),
        type: 'switch',
        tip: t('Defines the admin state of the listener.'),
      },
      insertHeaderFormItem,
    ];
  }

  onSubmit = (values) => {
    const {
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
      loadbalancer_id: this.containerProps.detail.id,
    };
    const insertHeaders = getInsertHeadersValueFromForm(insert_headers);
    if (insertHeaders) {
      data.insert_headers = insertHeaders;
    }
    if (default_tls_container_ref) {
      data.default_tls_container_ref =
        default_tls_container_ref.selectedRows[0].container_ref;
    }
    if (client_ca_tls_container_ref) {
      data.client_ca_tls_container_ref =
        client_ca_tls_container_ref.selectedRows[0].secret_ref;
      data.client_authentication = 'MANDATORY';
    }
    if (sni_container_refs) {
      data.sni_container_refs = sni_container_refs.selectedRows.map(
        (it) => it.container_ref
      );
    }
    return this.store.create(data);
  };
}

export default inject('rootStore')(observer(Create));
