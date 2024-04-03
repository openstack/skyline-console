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
import { StepAction } from 'containers/Action';
import globalSegmentStore from 'src/stores/masakari/segments';
import React from 'react';
import { Button, Modal } from 'antd';
import { toJS } from 'mobx';
import { QuestionCircleFilled } from '@ant-design/icons';
import stylesConfirm from 'src/components/Confirm/index.less';
import globalHostStore from 'src/stores/masakari/hosts';
import Notify from 'src/components/Notify';
import StepHost from './StepHost';
import StepSegment from './StepSegment';

export class StepCreate extends StepAction {
  static id = 'instance-ha-create';

  static title = t('Create Segment');

  static path = '/ha/segments-admin/create-step-admin';

  init() {
    this.store = globalHostStore;
    this.state = { btnIsLoading: false, ...this.state };
  }

  static policy = 'get_images';

  static allowed() {
    return Promise.resolve(true);
  }

  get name() {
    return t('Create Segment');
  }

  get listUrl() {
    return this.getRoutePath('masakariSegments');
  }

  get hasConfirmStep() {
    return false;
  }

  next() {
    this.currentRef.current.wrappedInstance.checkFormInput(
      (values) => {
        this.updateData(values);

        if (this.state.current === 0) {
          this.setState({ btnIsLoading: true });
          const { segment_name, recovery_method, service_type, description } =
            this.state.data;

          globalSegmentStore
            .create({
              segment: {
                name: segment_name,
                recovery_method,
                service_type,
                description,
              },
            })
            .then(
              (item) => {
                this.setState(
                  { extra: toJS({ createdSegmentId: item.segment.uuid }) },
                  () => {
                    this.setState((prev) => ({ current: prev.current + 1 }));
                  }
                );
              },
              (err) => {
                this.responseError = err;
                const { response: { data: responseData } = {} } = err;
                Notify.errorWithDetail(responseData, this.errorText);
              }
            )
            .finally(() => {
              this.setState({ btnIsLoading: false });
            });
        }
      },
      () => this.setState({ btnIsLoading: false })
    );
  }

  getNextBtn() {
    const { current } = this.state;
    if (current >= this.steps.length - 1) {
      return null;
    }
    const { title } = this.steps[current + 1];
    return (
      <Button
        type="primary"
        onClick={() => this.next()}
        loading={this.state.btnIsLoading}
      >
        {`${t('Next')}: ${title}`}
      </Button>
    );
  }

  getPrevBtn() {
    const { current } = this.state;
    if (current === 0) {
      return null;
    }
    const preTitle = this.steps[current - 1].title;
    return (
      <Button style={{ margin: '0 8px' }} onClick={() => this.prev()}>
        {`${t('Previous')}: ${preTitle}`}
      </Button>
    );
  }

  prev() {
    this.currentRef.current.wrappedInstance.checkFormInput(
      this.updateDataOnPrev,
      this.updateDataOnPrev
    );
    globalSegmentStore.delete({ id: this.state.extra.createdSegmentId });
  }

  onClickCancel = () => {
    if (this.state.current !== 0) {
      Modal.confirm({
        title: 'Confirm',
        icon: <QuestionCircleFilled className={stylesConfirm.warn} />,
        content:
          'Segment will be deleted. Are you sure want to cancel this created segment?',
        okText: 'Confirm',
        cancelText: 'Cancel',
        loading: true,
        onOk: () => {
          return globalSegmentStore
            .delete({ id: this.state.extra.createdSegmentId })
            .finally(() => this.routing.push(this.listUrl));
        },
      });
    } else {
      this.routing.push(this.listUrl);
    }
  };

  get steps() {
    return [
      { title: t('Create Segment'), component: StepSegment },
      { title: t('Add Host'), component: StepHost },
    ];
  }

  onSubmit = (values) => {
    const { name } = values;
    return Promise.resolve(
      name.selectedRows.forEach((item) => {
        const {
          binary,
          forced_down,
          host,
          id,
          state,
          status,
          updated_at,
          zone,
          ...hostData
        } = item;
        this.store.create(this.state.extra.createdSegmentId, {
          host: { name: host, ...hostData },
        });
      })
    );
  };
}

export default inject('rootStore')(observer(StepCreate));
