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

import React, { useEffect, useState } from 'react';
import { inject, observer } from 'mobx-react';
import { ModalAction } from 'containers/Action';
import { Col, Input, Row, Tag, Tooltip } from 'antd';
import globalTagStore from 'stores/keystone/tag';
import { PlusOutlined } from '@ant-design/icons';
import { projectTagsColors } from 'src/utils/constants';
import { isEqual } from 'lodash';

@inject('rootStore')
@observer
export default class ModifyTags extends ModalAction {
  static id = 'modify-project-tags';

  static title = t('Modify Project Tags');

  static buttonText = t('Modify Project Tags');

  static policy = 'identity:update_project_tags';

  static allowed = () => Promise.resolve(true);

  get name() {
    return t('modify project tags');
  }

  init() {
    this.state = {
      // tags: ,
      tags: this.props.item.tags,
    };
  }

  onSubmit = (values) =>
    globalTagStore.update({ project_id: this.props.item.id }, values);

  get formItems() {
    const { tags } = this.state;
    return [
      {
        name: 'tags',
        label: t('Tags'),
        component: <Tags tags={tags} />,
        validator: (rule, val) => {
          const initialTags = this.props.item.tags || [];

          // for init modal
          if (isEqual(val, initialTags)) {
            return Promise.resolve(true);
          }

          let errorTag = '';
          // 检测是否包含 / 和 ，
          if (
            val.some((tag) => {
              const ret = tag.includes('/') || tag.includes(',');
              ret && (errorTag = tag);
              return ret;
            })
          ) {
            return Promise.reject(
              new Error(t('Invalid Tag Value: {tag}', { tag: errorTag }))
            );
          }
          // 检测大小写
          if (initialTags.some(checkEqual)) {
            return Promise.reject(
              new Error(t('Duplicate tag name: {tag}', { tag: errorTag }))
            );
          }
          return Promise.resolve(true);

          function checkEqual(tag) {
            return val.some((v) => {
              // 不是原始值，并且新值大小写不敏感
              const flag = tag !== v && v.toLowerCase() === tag.toLowerCase();
              if (flag) {
                errorTag = v;
              }
              return flag;
            });
          }
        },
        extra: (
          <div>
            <div>1. {t('Tags are not case sensitive')}</div>
            <div>
              2. {t('Forward Slash ‘/’ is not allowed to be in a tag name')}
            </div>
            <div>
              3.{' '}
              {t(
                'Commas ‘,’ are not allowed to be in a tag name in order to simplify requests that specify lists of tags'
              )}
            </div>
          </div>
        ),
      },
    ];
  }
}

const Tags = ({ tags: source, onChange }) => {
  const [tags, setTags] = useState(source);
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [editInputIdx, setEditInputIdx] = useState(-1);
  const [editInputValue, setEditInputValue] = useState('');

  function handleClose(removedTag) {
    setTags(tags.filter((tag) => tag !== removedTag));
  }

  let editInput = null;
  let saveInput = null;
  const saveEditInputRef = (input) => {
    editInput = input;
  };

  const saveInputRef = (input) => {
    saveInput = input;
  };

  function handleEditInputChange(e) {
    setEditInputValue(e.target.value);
  }

  function handleEditInputConfirm() {
    const newTags = [...tags];
    newTags[editInputIdx] = editInputValue;
    setTags(newTags);
    setEditInputValue('');
    setEditInputIdx(-1);
  }

  function handleInputChange(e) {
    setInputValue(e.target.value);
  }

  function handleInputConfirm() {
    const retVal = inputValue.toLocaleLowerCase();
    if (inputValue && !tags.some((tag) => tag.toLowerCase() === retVal)) {
      setTags([...tags, inputValue]);
    }
    setInputVisible(false);
    setInputValue('');
  }

  function showInput() {
    setInputVisible(true);
  }

  useEffect(() => {
    saveInput && saveInput.focus();
  }, [inputVisible]);

  useEffect(() => {
    editInput && editInput.focus();
  }, [editInputIdx]);

  useEffect(() => {
    onChange(tags);
  }, [tags]);

  return (
    <Row gutter={[0, 8]}>
      {tags.map((tag, index) => {
        if (editInputIdx === index) {
          return (
            <Input
              ref={saveEditInputRef}
              style={{ width: 78, marginRight: 8, verticalAlign: 'top' }}
              key={tag}
              size="small"
              value={editInputValue}
              onChange={handleEditInputChange}
              onBlur={handleEditInputConfirm}
              onPressEnter={handleEditInputConfirm}
            />
          );
        }
        const isLongTag = tag.length > 20;
        const tagEl = (
          <Tag
            key={tag}
            closable
            onClose={() => handleClose(tag)}
            color={projectTagsColors[index % 10]}
          >
            <span
              style={{ whiteSpace: 'pre-wrap' }}
              onDoubleClick={(e) => {
                setEditInputIdx(index);
                setEditInputValue(tag);
                e.preventDefault();
              }}
            >
              {isLongTag ? `${tag.slice(0, 20)}...` : tag}
            </span>
          </Tag>
        );
        return (
          <Col span={24} key={tag}>
            {isLongTag ? (
              <Tooltip
                title={<span style={{ whiteSpace: 'pre-wrap' }}>{tag}</span>}
              >
                {tagEl}
              </Tooltip>
            ) : (
              tagEl
            )}
          </Col>
        );
      })}
      <Col span={24}>
        {inputVisible && (
          <Input
            ref={saveInputRef}
            style={{ width: 78, marginRight: 8, verticalAlign: 'top' }}
            type="text"
            size="small"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputConfirm}
            onPressEnter={handleInputConfirm}
          />
        )}
        {!inputVisible && (
          <Tag onClick={showInput}>
            <PlusOutlined /> New Tag
          </Tag>
        )}
      </Col>
    </Row>
  );
};
