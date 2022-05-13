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
import Base from 'components/Form';
import { yamlTip, validateYaml, paramTip } from 'resources/heat/stack';

export class Template extends Base {
  get isStep() {
    return true;
  }

  get title() {
    return t('Prepare Template');
  }

  get name() {
    return t('Prepare Template');
  }

  get isEdit() {
    return !!this.props.extra;
  }

  get defaultValue() {
    const { versionContent = '' } = this.state;
    return {
      versionContent,
      name: this.isEdit ? this.props.extra.stack_name : '',
    };
  }

  get fontStyle() {
    return {
      fontFamily:
        '"Menlo", "Liberation Mono", "Consolas", "DejaVu Sans Mono", "Ubuntu Mono", "Courier New", "andale mono", "lucida console", monospace',
    };
  }

  get formItems() {
    return [
      {
        name: 'name',
        label: t('Template Name'),
        type: 'label',
        hidden: !this.isEdit,
      },
      {
        name: 'content',
        label: t('Template Content'),
        type: 'textarea-from-file',
        required: true,
        tip: yamlTip,
        validator: validateYaml,
        rows: 10,
      },
      {
        name: 'params',
        label: t('Environment Variable'),
        type: 'textarea-from-file',
        tip: paramTip,
        validator: validateYaml,
        rows: 6,
      },
    ];
  }
}

export default inject('rootStore')(observer(Template));
