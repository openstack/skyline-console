import React, { Component } from 'react';
import { upperFirst } from 'lodash';
import { Progress } from 'antd';
import PropTypes from 'prop-types';
import Status from 'components/Status';
import styles from './index.less';

class Index extends Component {
  render() {
    const {
      primaryStatus,
      secondaryStatus,
      current,
      isProcessing,
      processPercent,
    } = this.props;

    const getColor = () => {
      if (current === primaryStatus) return globalCSS.primaryColor;
      if (current === secondaryStatus) return globalCSS.secondaryColor;
      return globalCSS.successColor;
    };

    if (!isProcessing) {
      return <Status status={current} text={upperFirst(current)} />;
    }

    return (
      <div className={styles.container}>
        <Progress
          strokeColor={getColor()}
          trailColor="#DFE1EC"
          percent={processPercent}
          showInfo={false}
        />
        <div className={styles.text}>
          {`${upperFirst(current)}  ${processPercent}%`}
        </div>
      </div>
    );
  }
}

Index.propTypes = {
  primaryStatus: PropTypes.string,
  secondaryStatus: PropTypes.string,
  current: PropTypes.string.isRequired,
  isProcessing: PropTypes.bool,
  processPercent: PropTypes.number,
};

Index.defaultProps = {
  primaryStatus: 'uploading',
  secondaryStatus: 'importing',
  isProcessing: false,
  processPercent: 0,
};

export default Index;
