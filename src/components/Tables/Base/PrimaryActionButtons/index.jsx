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

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { generateId } from 'utils/index';
import { isEqual } from 'lodash';
import ActionButton from '../ActionButton';
import { getAllowedResults, getAction } from '../Action';

// The buttons above the table
export default class TablePrimaryButtons extends Component {
  static propTypes() {
    return {
      visibleButtonNumber: PropTypes.number,
      primaryActions: PropTypes.array,
      onFinishAction: PropTypes.func,
      onCancelAction: PropTypes.func,
      routing: PropTypes.object.isRequired,
      containerProps: PropTypes.object,
      onClickAction: PropTypes.func,
      primaryActionsExtra: PropTypes.any,
      isCreateIcon: PropTypes.bool,
    };
  }

  static defaultProps = {
    visibleButtonNumber: 3,
    primaryActions: [],
    onFinishAction: null,
    onCancelAction: null,
    containerProps: {},
    primaryActionsExtra: null,
    isCreateIcon: true,
  };

  constructor(props) {
    super(props);
    this.state = {
      primaryAllowedResults: [],
    };
    this.actionList = this.getActionList(props);
  }

  componentDidMount() {
    this.getActionsAllowed();
  }

  componentDidUpdate(prevProps) {
    if (!isEqual(prevProps, this.props)) {
      this.getActionsAllowed();
    }
  }

  async getActionsAllowed() {
    const { containerProps, primaryActionsExtra, isAdminPage } = this.props;
    const { detail = null } = containerProps;
    const results = await getAllowedResults({
      actions: this.actionList,
      data: detail,
      containerProps,
      key: null,
      extra: primaryActionsExtra,
      isAdminPage,
    });
    this.setState({
      primaryAllowedResults: results,
    });
  }

  onClickAction = () => {
    const { onClickAction } = this.props;
    onClickAction && onClickAction();
  };

  getActionList(props) {
    const { primaryActions, containerProps } = props;
    const actionList = primaryActions.map((it) =>
      getAction(it, null, containerProps)
    );
    return actionList;
  }

  render() {
    const { primaryAllowedResults } = this.state;
    const {
      onFinishAction,
      routing,
      containerProps,
      onCancelAction,
      onClickAction,
      isCreateIcon,
    } = this.props;
    const primaryActionButtons = this.actionList.map((it, index) => {
      const key = `primary-${generateId()}`;
      const { id, title, buttonType, actionType, buttonText, isDanger } = it;
      const config = {
        id,
        title,
        name: buttonText || title,
        buttonType,
        isDanger,
        actionType,
        action: it,
        buttonClassName: it?.buttonClassName,
      };
      const getIsCreateIcon = () => {
        if (it?.id === 'monitor') {
          return false;
        }
        return isCreateIcon;
      };
      return (
        <ActionButton
          // {...it}
          {...config}
          key={key}
          isAllowed={primaryAllowedResults[index]}
          onFinishAction={onFinishAction}
          routing={routing}
          containerProps={containerProps}
          onClickAction={onClickAction}
          onCancelAction={onCancelAction}
          isCreateIcon={getIsCreateIcon()}
        />
      );
    });
    return <>{primaryActionButtons}</>;
  }
}
