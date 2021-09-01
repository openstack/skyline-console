import { isBoolean, isNil, isObjectLike } from 'lodash';

export function getStringValue(value) {
  if (
    isNil(value) ||
    (isObjectLike(value) && Object.keys(value).length === 0)
  ) {
    return '-';
  }
  if (isBoolean(value)) {
    return value.toString();
  }
  return value;
}

export function columnRender(render, value, record) {
  if (render) {
    return getStringValue(render(value, record));
  }
  return getStringValue(value);
}
