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
import { Col, Input, Row, Tag, Tooltip, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { projectTagsColors } from 'src/utils/constants';
import PropTypes from 'prop-types';

const Tags = ({ tags: source, onChange, maxLength, maxCount }) => {
  const [tags, setTags] = useState(source);
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [editInputIdx, setEditInputIdx] = useState(-1);
  const [editInputValue, setEditInputValue] = useState('');
  const tagLength = maxLength && maxLength > 0 ? { maxLength } : {};
  const tagCount = (maxCount && maxCount > 0) || -1;

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
    const trimmedValue = inputValue.trim();
    if (!trimmedValue) {
      setInputVisible(false);
      setInputValue('');
      return;
    }
    const retVal = trimmedValue.toLocaleLowerCase();
    if (!tags.some((tag) => tag.toLowerCase() === retVal)) {
      if (tagCount !== -1 && tags.length < maxCount) {
        setTags([...tags, trimmedValue]);
      } else if (tagCount === -1) {
        setTags([...tags, trimmedValue]);
      }
    }
    setInputVisible(false);
    setInputValue('');
  }

  function handleAddClick() {
    handleInputConfirm();
  }

  function handleCancel() {
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
              {...tagLength}
            />
          );
        }
        const isLongTag = tag.length > 20;
        const tagText = isLongTag ? `${tag.slice(0, 20)}...` : tag;
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
              {tagText}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Input
              ref={saveInputRef}
              style={{ width: 78, verticalAlign: 'top' }}
              type="text"
              size="small"
              value={inputValue}
              onChange={handleInputChange}
              onPressEnter={handleAddClick}
              {...tagLength}
            />
            <Button size="small" type="primary" onClick={handleAddClick}>
              {t('Add')}
            </Button>
            <Button size="small" onClick={handleCancel}>
              {t('Cancel')}
            </Button>
          </div>
        )}
        {!inputVisible && (
          <Tag onClick={showInput} style={{ cursor: 'pointer' }}>
            <PlusOutlined /> {t('New Tag')}
          </Tag>
        )}
      </Col>
    </Row>
  );
};

Tags.propTypes = {
  tags: PropTypes.array,
  onChange: PropTypes.func,
  maxLength: PropTypes.number,
  maxCount: PropTypes.number,
};

export default Tags;
