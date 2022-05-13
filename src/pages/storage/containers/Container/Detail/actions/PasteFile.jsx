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
import { ConfirmAction } from 'containers/Action';
import globalObjectStore from 'stores/swift/object';
import { allCanChangePolicy } from 'resources/skyline/policy';
import { isFolder } from 'resources/swift/container';

export default class PasteFile extends ConfirmAction {
  get id() {
    return 'PasteFile';
  }

  get title() {
    return t('Paste File');
  }

  get name() {
    return this.title;
  }

  get buttonText() {
    return t('Paste');
  }

  get actionName() {
    return t('paste files to folder');
  }

  get copiedFiles() {
    const { copiedFiles = [] } = globalObjectStore;
    return copiedFiles;
  }

  get folderInStore() {
    const { container: { folder } = {} } = globalObjectStore;
    return folder;
  }

  get containerInStore() {
    const { container: { name } = {} } = globalObjectStore;
    return name;
  }

  getFileNames() {
    return this.copiedFiles.map((it) => it.shortName).join(', ');
  }

  getSourcePath() {
    const { container, folder } = this.copiedFiles[0] || {};
    return `${container}/${folder}`;
  }

  getItemName = (item) => {
    if (item) {
      return item.shortName;
    }
    return this.folderInStore || t('Root directory');
  };

  policy = allCanChangePolicy;

  confirmContext = (data) => {
    const name = this.getName(data);
    return (
      <div>
        <p>
          {this.unescape(
            t('Are you sure to {action} (instance: {name})?', {
              action: this.actionNameDisplay || this.title,
              name,
            })
          )}
        </p>
        <p>
          {this.unescape(
            t('Source Path: {path}', { path: this.getSourcePath() })
          )}
        </p>
        <p>
          {this.unescape(t('Files: {names}', { names: this.getFileNames() }))}
        </p>
        <p>{t('The file with the same name will be overwritten.')}</p>
      </div>
    );
  };

  allowedCheckFunc = (item) => {
    if (!item) {
      const { hasCopy } = globalObjectStore;
      return hasCopy && this.checkFolder();
    }
    return isFolder(item) && item.hasCopy && this.checkFolder(item);
  };

  checkFolder = (item) => {
    const { container, folder } = this.copiedFiles[0] || {};
    if (item) {
      return item.container !== container || item.name !== folder;
    }
    return this.containerInStore !== container || this.folderInStore !== folder;
  };

  performErrorMsg = (failedItems) => {
    if (!globalObjectStore.hasCopy) {
      return t('There is currently no file to paste.');
    }
    if (!this.checkFolder(failedItems)) {
      return t('Unable to paste into the same folder.');
    }
    const name = this.getName(failedItems);
    return t('You are not allowed to {action}, instance: {name}.', {
      action: this.actionNameDisplay || this.title,
      name,
    });
  };

  onSubmit = (data) => {
    if (data) {
      return globalObjectStore.pasteFiles(data);
    }
    return globalObjectStore.pasteFiles();
  };
}
