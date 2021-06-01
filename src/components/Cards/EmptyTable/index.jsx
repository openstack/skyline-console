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
import PropTypes from 'prop-types';
import classnames from 'classnames';

import { Row, Col, Button } from 'antd';

import styles from './index.less';

export default class EmptyList extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    name: PropTypes.string,
    desc: PropTypes.string,
    createText: PropTypes.string,
    operations: PropTypes.oneOfType([PropTypes.node, PropTypes.element]),
    onCreate: PropTypes.func,
  };

  static defaultProps = {
    name: '',
  };

  render() {
    const { className, name, operations, onCreate, createText } = this.props;
    const desc =
      this.props.desc ||
      t(`${name.split(' ').join('_').toUpperCase()}_CREATE_DESC`);

    const btnText = createText || `${t('Create ')}${t(name)}`;

    return (
      <div className={classnames(styles.wrapper, className)}>
        <Row>
          <Col className="is-narrow">
            <img src="/asset/image/empty-card.svg" alt="" />
          </Col>
          <Col>
            <p
              className={styles.desc}
              dangerouslySetInnerHTML={{
                __html: desc,
              }}
            />
            {operations ||
              (onCreate && (
                <Button type="control" onClick={onCreate}>
                  {btnText}
                </Button>
              ))}
          </Col>
        </Row>
      </div>
    );
  }
}
