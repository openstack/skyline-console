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

import { ironicBase } from 'utils/constants';
import { action } from 'mobx';
import Base from '../base';

export class IronicPortStore extends Base {
  get module() {
    return 'ports';
  }

  get apiVersion() {
    return ironicBase();
  }

  get responseKey() {
    return 'port';
  }

  getListDetailUrl = ({ id }) =>
    `${this.apiVersion}/nodes/${id}/${this.module}/detail`;

  get paramsFunc() {
    return () => {};
  }

  @action
  create(data) {
    return this.submitting(request.post(this.getListUrl(), data));
  }

  @action
  edit({ id }, body) {
    return this.submitting(request.patch(`${this.getDetailUrl({ id })}`, body));
  }
}

const globalIronicPortStore = new IronicPortStore();
export default globalIronicPortStore;
