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

import { cinderBase } from 'utils/constants';
import { action } from 'mobx';
import Base from '../base';

export class ServiceStore extends Base {
  get module() {
    return 'os-services';
  }

  get apiVersion() {
    return cinderBase();
  }

  get responseKey() {
    return 'service';
  }

  getListUrl = () =>
    `${this.apiVersion}/${globals.user.project.id}/${this.module}`;

  @action
  operate(actionName, body) {
    const url = `${this.getListUrl()}/${actionName}`;
    return this.submitting(request.put(url, body));
  }

  @action
  enable(body) {
    return this.operate('enable', body);
  }

  @action
  disable(body) {
    return this.operate('disable-log-reason', body);
  }
}

const globalServiceStore = new ServiceStore();
export default globalServiceStore;
