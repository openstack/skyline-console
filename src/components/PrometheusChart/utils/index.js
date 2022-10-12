import { get, clone, isArray } from 'lodash';
import DataSet from '@antv/data-set';
import { baseReturnFunc, fetchPrometheus, getRequestUrl } from './utils';

export function createFetchPrometheusClient(createParams, fetchPrometheusFunc) {
  const { requestType, metricKey, convertUrl } = createParams;

  const queryParams = get(METRICDICT, metricKey);

  return async function ({ params = {}, currentRange, interval }) {
    const promises = queryParams.url.map((u, idx) => {
      // get aggregate data in order
      const finalFormatFunc =
        (queryParams.finalFormatFunc || [])[idx] || baseReturnFunc;
      // get base params in order
      const baseParams = (queryParams.baseParams || [])[idx] || {};
      const formattedUrl = getRequestUrl(
        u,
        params,
        finalFormatFunc,
        baseParams
      );
      const finalUrl = convertUrl ? convertUrl(formattedUrl) : formattedUrl;
      return fetchPrometheusFunc
        ? fetchPrometheusFunc(finalUrl, requestType, currentRange, interval)
        : fetchPrometheus(finalUrl, requestType, currentRange, interval);
    });
    return Promise.all(promises);
  };
}

export function createDataHandler(params) {
  const { formatDataFn, typeKey, deviceKey, modifyKeys } = params;

  return (data) => {
    const formattedData = formatDataFn(data, typeKey, deviceKey, modifyKeys);
    const retData = clone(formattedData);
    let device = '';
    let devices = [];
    if (
      isArray(formattedData) &&
      formattedData.length !== 0 &&
      formattedData[0].device
    ) {
      const dv = new DataSet()
        .createView()
        .source(formattedData)
        .transform({
          type: 'partition',
          groupBy: ['device'],
        });
      devices = Object.keys(dv.rows).map((d) => d.slice(1, d.length));
      device = devices[0];
    }
    return {
      retData,
      device,
      devices,
    };
  };
}
