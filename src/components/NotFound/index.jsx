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
import styles from './index.less';

export default class NotFound extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      time: 10,
    };
  }

  componentDidMount() {
    this.interval = setInterval(() => {
      this.setState(({ time }) => ({
        time: Math.max(time - 1, 0),
      }));
    }, 1100);
  }

  UNSAFE_componentWillUpdate(nextProps, nextState) {
    if (nextState.time === 0) {
      if (this.interval) {
        clearInterval(this.interval);
      }

      window.location.href = '/';
    }
  }

  componentWillUnmount() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  render() {
    return (
      <div className={styles.wrapper}>
        <img
          className={styles.image}
          src="/asset/image/empty-card.svg"
          alt=""
        />
        <div className={styles.text}>
          <div className="h1">Not Found</div>
          <p>
            {t.html('NOT_FOUND_DESC', {
              time: this.state.time,
              link: '/',
            })}
          </p>
        </div>
      </div>
    );
  }
}
