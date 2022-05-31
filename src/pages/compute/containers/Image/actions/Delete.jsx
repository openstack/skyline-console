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
import globalImageStore from 'stores/glance/image';
import { isOwner } from 'resources/glance/image';

export default class DeleteAction extends ConfirmAction {
  get id() {
    return 'delete';
  }

  get title() {
    return t('Delete Image');
  }

  get isDanger() {
    return true;
  }

  get buttonText() {
    return t('Delete');
  }

  get actionName() {
    return t('delete image');
  }

  policy = 'delete_image';

  allowedCheckFunc = (item) => {
    if (!item) {
      return true;
    }
    return (
      this.notDeleted(item) &&
      this.notProtected(item) &&
      (isOwner(item) || this.isAdminPage)
    );
  };

  notDeleted(image) {
    return image.status !== 'deleted';
  }

  notProtected(image) {
    return !image.protected;
  }

  onSubmit = (data) => globalImageStore.delete({ id: data.id });
}
