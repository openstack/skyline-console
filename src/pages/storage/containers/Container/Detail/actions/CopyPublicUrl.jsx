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
import globalContainerStore from 'stores/swift/container';
import { allCanReadPolicy } from 'resources/skyline/policy';
import { swiftEndpoint } from 'client/client/constants';
import globalRootStore from 'stores/root';

export default class CopyPublicUrl extends ConfirmAction {
  get id() {
    return 'copy-public-url';
  }

  get title() {
    return t('Copy Public URL');
  }

  get name() {
    return this.title;
  }

  get actionName() {
    return t('copy public URL');
  }

  get buttonText() {
    return this.title;
  }

  policy = allCanReadPolicy;

  getItemName = (item) => item.shortName;

  get messageHasItemName() {
    return true;
  }

  get isAsyncAction() {
    return false;
  }

  submitSuccessMsg = (data) => {
    const name = this.getName(data);
    return t('Public URL for "{name}" copied to clipboard.', { name });
  };

  submitErrorMsg = (data, realError) => {
    const errorMsg =
      typeof realError === 'string' ? realError : realError?.message || null;

    if (errorMsg) {
      return errorMsg;
    }

    const name = this.getName(data) || t('Unknown');
    return t('Unable to {action}, instance: {name}.', {
      action: this.actionNameDisplay || this.title,
      name,
    });
  };

  confirmContext = (data) => {
    const name = this.getName(data);
    return t('Copy the public URL for "{name}" to clipboard?', { name });
  };

  allowedCheckFunc = (item) => isFile(item) && !!item.isPublic;

  getPublicUrl = (container, objectPath) => {
    let swiftPublicEndpoint = swiftEndpoint();
    if (!swiftPublicEndpoint) {
      throw new Error('Swift public endpoint not available');
    }

    if (swiftPublicEndpoint.startsWith('/')) {
      swiftPublicEndpoint = `${window.location.origin}${swiftPublicEndpoint}`;
    }

    const projectId =
      globalContainerStore.client?.project ||
      globalRootStore?.user?.project?.id ||
      globalRootStore?.projectId;
    if (!projectId) {
      throw new Error('Project ID not available');
    }

    const cleanEndpoint = swiftPublicEndpoint.replace(/\/$/, '');
    const baseUrl = cleanEndpoint.includes('/v1')
      ? cleanEndpoint
      : `${cleanEndpoint}/v1`;

    const encodedPath = objectPath
      .split('/')
      .map((segment) => encodeURIComponent(segment))
      .join('/');

    return `${baseUrl}/AUTH_${projectId}/${container}/${encodedPath}`;
  };

  copyToClipboardFallback = (text) => {
    const textArea = document.createElement('textarea');
    textArea.value = String(text);
    Object.assign(textArea.style, {
      position: 'fixed',
      top: '-9999px',
      left: '-9999px',
      opacity: '0',
      pointerEvents: 'none',
    });
    document.body.appendChild(textArea);
    try {
      textArea.select();
      return document.execCommand('copy');
    } catch {
      return false;
    } finally {
      document.body.removeChild(textArea);
    }
  };

  copyToClipboard = async (text) => {
    if (text == null) return false;
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(String(text));
        return true;
      } catch {
        // Fallback to execCommand
      }
    }
    return this.copyToClipboardFallback(text);
  };

  onSubmit = async (item) => {
    const { publicUrl, container, name } = item;
    if (!container || !name) {
      throw new Error(
        t('Unable to generate public URL. Missing container or object name.')
      );
    }

    return this.copyToClipboard(
      publicUrl || this.getPublicUrl(container, name)
    );
  };
}
