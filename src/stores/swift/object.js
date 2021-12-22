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

import { action, observable } from 'mobx';
import client from 'client';
import { getArrayBuffer } from 'utils/file';
import Base from '../base';

export class ObjectStore extends Base {
  @observable
  container = null;

  @observable
  data = [];

  @observable
  hasNext = false;

  @observable
  copiedFiles = [];

  @observable
  hasCopy = false;

  @observable
  isCopy = true;

  get client() {
    return client.swift.container.object;
  }

  get containerClient() {
    return client.swift.container;
  }

  get listResponseKey() {
    return '';
  }

  get listFilterByProject() {
    return false;
  }

  async listFetchByClient(params, originParams) {
    const { folder, container } = originParams;
    const { path } = params;
    const result = await this.client.list(container, params);
    this.container = {
      name: container,
      folder,
      path,
      hasCopy: this.copiedFiles.length > 0,
    };
    return result;
  }

  get paramsFunc() {
    return (params) => {
      const { current, container, folder, search = '', path, ...rest } = params;
      const realPath = path || (folder || search ? `${folder}${search}` : '');
      const newParams = {
        format: 'json',
        ...rest,
      };
      if (realPath) {
        newParams.path = realPath;
      } else {
        newParams.delimiter = '/';
      }
      return newParams;
    };
  }

  getShortName = (item, folder) => {
    const { name, subdir } = item;
    const lName = subdir || name;
    return lName.substring((folder || '').length) || lName;
  };

  isFolder = (item) => item.subdir || item.name.slice(-1) === '/';

  getItemType = (it) => {
    return this.isFolder(it) ? 'folder' : 'file';
  };

  async listDidFetch(items) {
    if (items.length === 0) {
      return items;
    }
    return this.updateData(items);
  }

  async detailFetchByClient(resourceParams) {
    const { container, name } = resourceParams;
    const result = await this.containerClient.showObjectMetadata(
      container,
      name
    );
    const { headers = {} } = result;
    const data = {
      timestamp: headers['x-timestamp'],
      contentType: headers['content-type'],
      etag: headers.etag,
      size: headers['content-length'],
      originFileName: headers['x-object-meta-orig-filename'],
    };
    return data;
  }

  @action
  updateData = (items) => {
    const { name, path, folder, hasCopy } = this.container || {};
    return items.map((it) => {
      return {
        ...it,
        container: name,
        path,
        folder,
        type: this.getItemType(it),
        hasCopy,
        shortName: this.getShortName(it, folder),
        name: it.subdir || it.name,
      };
    });
  };

  @action
  async createFolder(container, data) {
    const { folder_name, dest_folder = '' } = data;
    const name = `${dest_folder}${folder_name}/`;
    await this.checkName(container, name);
    return this.submitting(this.containerClient.createFolder(container, name));
  }

  @action
  async createFile(container, data, config = {}) {
    const { file, dest_folder = '' } = data;
    const name = `${dest_folder}${file.name}`;
    await this.checkName(container, name);
    const headers = {
      'X-Object-Meta-Orig-Filename': encodeURIComponent(file.name),
      'Content-Length': file.size,
      'Content-Type': file.type,
    };
    const content = await getArrayBuffer(file);
    return this.submitting(
      this.containerClient.uploadFile(container, name, content, {
        headers,
        ...config,
      })
    );
  }

  @action
  async updateFile(container, file, name, config = {}) {
    const headers = {
      'X-Object-Meta-Orig-Filename': encodeURIComponent(file.name),
      'Content-Length': file.size,
      'Content-Type': file.type,
    };
    const content = await getArrayBuffer(file);
    return this.submitting(
      this.containerClient.uploadFile(container, name, content, {
        headers,
        ...config,
      })
    );
  }

  @action
  async rename(container, name, newname) {
    this.isSubmitting = true;
    await this.checkName(container, newname);
    await this.containerClient.copy(container, name, container, newname);
    return this.delete({ container, name });
  }

  @action
  async downloadFile({ container, name }) {
    return this.client.show(container, name, null, {
      responseType: 'blob',
    });
  }

  @action
  delete = async ({ container, name }) => {
    return this.submitting(this.client.delete(container, name));
  };

  @action
  checkName = async (container, name) => {
    try {
      await this.containerClient.showObjectMetadata(container, name);
      const err = {
        response: {
          data: t('An object with the same name already exists'),
        },
      };
      return Promise.reject(err);
    } catch (e) {
      return true;
    }
  };

  @action
  copyFiles = async (files) => {
    this.copiedFiles = files;
    this.hasCopy = files.length > 0;
    this.isCopy = true;
    return Promise.resolve();
  };

  @action
  cutFiles = async (files) => {
    this.copiedFiles = files;
    this.hasCopy = files.length > 0;
    this.isCopy = false;
    return Promise.resolve();
  };

  @action
  pasteFiles = async (folder) => {
    if (this.copiedFiles.length === 0) {
      return Promise.reject();
    }
    let realFolder = folder;
    if (!folder) {
      realFolder = {
        container: this.container.name,
        name: this.container.folder,
      };
    }
    if (this.isCopy) {
      return this.pasteObjects(realFolder);
    }
    return this.moveObjects(realFolder);
  };

  @action
  async pasteObjects(folder) {
    const { container: toContainer, name } = folder;
    const { container: fromContainer } = this.copiedFiles[0];
    await Promise.all(
      this.copiedFiles.map((it) => {
        const { shortName, name: fromName } = it;
        const toName = `${name}${shortName}`;
        return this.containerClient.copy(
          fromContainer,
          fromName,
          toContainer,
          toName
        );
      })
    );
    return Promise.resolve();
  }

  @action
  async moveObjects(folder) {
    await this.pasteObjects(folder);
    const { container: originContainer } = this.copiedFiles[0];
    await Promise.all(
      this.copiedFiles.map((it) => {
        const { name: fileName } = it;
        return this.client.delete(originContainer, fileName);
      })
    );
    this.copiedFiles = [];
    this.hasCopy = false;
    return Promise.resolve();
  }

  @action
  clearData(listUnmount) {
    this.list.reset();
    if (!listUnmount) {
      this.copiedFiles = [];
      this.hasCopy = false;
      this.container = null;
    }
  }
}

const globalObjectStore = new ObjectStore();
export default globalObjectStore;
