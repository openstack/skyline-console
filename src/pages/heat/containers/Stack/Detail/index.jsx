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
import Base from 'containers/TabDetail';
import { StackStore } from 'stores/heat/stack';
import { stackStatus } from 'resources/heat/stack';
import BaseDetail from './BaseDetail';
import Resource from './Resource';
import Event from './Event';
import Template from './Template';
import actionConfigs from '../actions';

export class StackDetail extends Base {
  get name() {
    return t('stack');
  }

  get policy() {
    return 'stacks:show';
  }

  get listUrl() {
    return this.getRoutePath('stack');
  }

  init() {
    this.store = new StackStore();
  }

  get actionConfigs() {
    return actionConfigs;
  }

  get detailInfos() {
    return [
      {
        title: t('Name'),
        dataIndex: 'stack_name',
      },
      {
        title: t('Stack Status'),
        dataIndex: 'stack_status',
        valueMap: stackStatus,
      },
      {
        title: t('Description'),
        dataIndex: 'description',
      },
      {
        title: t('Created At'),
        dataIndex: 'creation_time',
        valueRender: 'toLocalTime',
      },
      {
        title: t('Updated At'),
        dataIndex: 'updated_time',
        valueRender: 'toLocalTime',
      },
    ];
  }

  get tabs() {
    const tabs = [
      {
        title: t('Detail'),
        key: 'detail',
        component: BaseDetail,
      },
      {
        title: t('Stack Resources'),
        key: 'resource',
        component: Resource,
      },
      {
        title: t('Stack Events'),
        key: 'event',
        component: Event,
      },
      {
        title: t('YAML File'),
        key: 'template',
        component: Template,
      },
    ];
    return tabs;
  }
}

export default inject('rootStore')(observer(StackDetail));
