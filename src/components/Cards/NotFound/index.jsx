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
import emptyCard from 'asset/image/empty-card.svg';
import { firstUpperCase } from 'utils/index';
import { Link } from 'react-router-dom';
import styles from './index.less';

export default class NotFound extends React.Component {
  render() {
    const { title, link, codeError, endpointError, goList, isAction } =
      this.props;
    let h = '';
    if (codeError) {
      h = 'Error';
    } else if (endpointError) {
      h = t('Not Open');
    } else {
      h = t('Resource Not Found');
    }
    let pTitle = '';
    let linkTitle = '';
    if (isAction) {
      pTitle = t('Unable to {title}, please go back to ', {
        title: firstUpperCase(title),
      });
    } else if (goList) {
      pTitle = t('Unable to get {title}, please go back to ', {
        title: firstUpperCase(title),
      });
    } else {
      pTitle = t('Unable to get {title}, please go to ', {
        title: firstUpperCase(title),
      });
    }
    if (goList) {
      linkTitle = <Link to={link}>{t('list page')}</Link>;
    } else {
      linkTitle = <Link to={link}>{t('Home page')}</Link>;
    }
    const p = (
      <p>
        {pTitle}
        {linkTitle}
      </p>
    );
    return (
      <div className={styles.wrapper}>
        <img className={styles.image} src={emptyCard} alt="" />
        <div className={styles.text}>
          <div className="h1">{h}</div>
          {p}
        </div>
      </div>
    );
  }
}
