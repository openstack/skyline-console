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

import { ConfirmAction } from 'containers/Action';
import { isFile } from 'resources/swift/container';
import globalObjectStore from 'stores/swift/object';
import { allCanChangePolicy } from 'resources/skyline/policy';
import FileSaver from 'file-saver';

export default class Download extends ConfirmAction {
  get id() {
    return 'download';
  }

  get title() {
    return t('Download File');
  }

  get name() {
    return t('Download File');
  }

  get actionName() {
    return t('Download File');
  }

  policy = allCanChangePolicy;

  getItemName = (item) => item.shortName;

  allowedCheckFunc = (item) => isFile(item);

  onSubmit = async (values) => {
    return globalObjectStore.downloadFile(values).then((res) => {
      const { shortName } = values;
      if (res.data) {
        return FileSaver.saveAs(res.data, shortName);
      }
      return FileSaver.saveAs(res, shortName);
    });
  };
}
