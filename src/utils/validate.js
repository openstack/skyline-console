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

import { isString, isNil } from 'lodash';
import { Address4, Address6 } from 'ip-address';
import cidrRegex from 'cidr-regex';
import { isValidPhoneNumber } from 'libphonenumber-js';

const { v4, v6 } = cidrRegex;

function isValidPort(portStr) {
  if (/^\d+$/.test(portStr) && (portStr === '0' || portStr[0] !== '0')) {
    const port = parseInt(portStr, 10);
    return port >= 0 && port <= 65535;
  }
  return false;
}

function validatePortRange(inputStr) {
  const parts = inputStr.split(':');

  if (parts.length > 2) {
    return false;
  }

  for (let i = 0; i < parts.length; i++) {
    if (!isValidPort(parts[i])) {
      return false;
    }
  }

  return true;
}

const portRangeRegex = validatePortRange;

const cidr = cidrRegex({ exact: true });
const ipCidr = v4({ exact: true });
const ipv6Cidr = v6({ exact: true });
const nameRegex =
  /^[a-zA-Z\u4e00-\u9fa5][\u4e00-\u9fa5\w"'\[\]^.:()_-]{0,127}$/; // eslint-disable-line
const macRegex = /^[A-F0-9]{2}(:[A-F0-9]{2}){5}$/;
const ipWithMask =
  /^(?:(?:[0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}(?:[0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\/([1-9]|[1-2]\d|3[0-2])$/;
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\\[\]`~!@#$%^&*><()_\-+=?:"{}|,.\\/;'])[A-Za-z\d\\[\]`~!@#$%^&*><()_\-+=?:"{}|,.\\/;']{8,32}$/;
const instancePasswordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d\\[\]`~!@#$%^&*()_\-+=?:"{}|,.\\/;']{8,16}$/;
const emailRegex =
  /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/;
const nameRegexWithoutChinese = /^[a-zA-Z][\w"'\[\]^.:()_-]{0,127}$/; // eslint-disable-line
const fileNameRegex = /^[A-Za-z]+[A-Za-z\d-]{2,62}$/;
const stackNameRegex = /^[A-Za-z]+[A-Za-z\d._-]{1,254}$/;
const keypairNameRegex = /^[a-zA-Z][\w_-]{0,127}$/;
const crontabNameRegex =
  /^[a-zA-Z\u4e00-\u9fa5][\u4e00-\u9fa5\w"'\[\]^.:()_-]{0,63}$/; // eslint-disable-line
const imageNameRegex =
  /^[a-zA-Z\u4e00-\u9fa5][\u4e00-\u9fa5\w"'\[\].()_-]{0,127}$/; // eslint-disable-line
const instanceNameRegex =
  /^[a-zA-Z\u4e00-\u9fa5][\u4e00-\u9fa5\w"'._-]{0,127}$/;
const ipv6CidrOnly =
  /^(([a-zA-Z]|[a-zA-Z][a-zA-Z0-9-]*[a-zA-Z0-9])\.)*([A-Za-z]|[A-Za-z][A-Za-z0-9-]*[A-Za-z0-9])$|^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*\/(1[01][0-9]|12[0-8]|[0-9]{1,2})$/;
const asciiRegex = /^[\x00-\x7f]*$/; // eslint-disable-line
const swiftFileNameRegex =
  /^[A-Za-z\u4e00-\u9fa5]+[A-Za-z\u4e00-\u9fa5\d-.]{2,62}$/;
const domainRegex =
  /^[a-zA-Z0-9]([-a-zA-Z0-9]{0,62}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([-a-zA-Z0-9]{0,62}[a-zA-Z0-9])?)*$/;
const databaseNameRegex = /^(?=.*[0-9a-zA-Z])[-_0-9a-zA-Z]{2,64}$/;
const databaseUserRegex = /^(?=.*[0-9a-zA-Z])[-_0-9a-zA-Z]{1,16}$/;

export const regex = {
  cidr,
  ipCidr,
  ipv6Cidr,
  nameRegex,
  macRegex,
  portRangeRegex,
  ipWithMask,
  passwordRegex,
  instancePasswordRegex,
  emailRegex,
  nameRegexWithoutChinese,
  fileNameRegex,
  keypairNameRegex,
  imageNameRegex,
  instanceNameRegex,
  ipv6CidrOnly,
  asciiRegex,
  swiftFileNameRegex,
};

export const isDomain = (value) => {
  if (value && isString(value)) {
    return domainRegex.test(value);
  }
  return false;
};

export const isDatabaseName = (value) => {
  if (value && isString(value)) {
    return databaseNameRegex.test(value);
  }
  return false;
};

export const isDatabaseUserName = (value) => {
  if (value && isString(value)) {
    return databaseUserRegex.test(value);
  }
  return false;
};

export const isPhoneNumber = (value) => isValidPhoneNumber(value);

export const isEmailNumber = (value) => emailRegex.test(value);

export const isMacAddress = (value) => macRegex.test(value);

function zfill(num, len) {
  return (Array(len).join('0') + num).slice(-len);
}

const isIpWithMask = (value) => ipWithMask.test(value);

const ipFull = (ipAdd) =>
  ipAdd
    .split('.')
    .map((item) => zfill(item, 3))
    .join('.');

const isIPv4 = (value) => value && Address4.isValid(value);

const isIpv6 = (value) => value && Address6.isValid(value);

const isCidr = (value) => cidr.test(value);

const isIpCidr = (value) => ipCidr.test(value);

const isIPv6Cidr = (value) => ipv6Cidr.test(value);

const isIPv6CidrOnly = (value) => ipv6CidrOnly.test(value);

// eslint-disable-next-line no-shadow
const isIpInRange = (ip, start, end) => {
  const ipToInt = (IP) =>
    parseInt(
      IP.replace(/\d+\.?/gi, (a) => {
        a = parseInt(a, 10);
        return (a > 15 ? '' : '0') + a.toString(16);
      }),
      16
    );

  const between = (x, min, max) => x >= min && x <= max;

  return between(ipToInt(ip), ipToInt(start), ipToInt(end));
};

const isIpInRangeIPv4 = (ipStr, start, end) => {
  const startInt = new Address4(start).bigInteger();
  const endInt = new Address4(end).bigInteger();
  const ipInt = new Address4(ipStr).bigInteger();
  return ipInt >= startInt && ipInt <= endInt;
};

const isIpInRangeIPv6 = (ipStr, start, end) => {
  const startInt = new Address6(start).bigInteger();
  const endInt = new Address6(end).bigInteger();
  const ipInt = new Address6(ipStr).bigInteger();
  return ipInt >= startInt && ipInt <= endInt;
};

const isIpInRangeAll = (ipStr, start, end) => {
  if (isIPv4(ipStr) && isIPv4(start) && isIPv4(end)) {
    return isIpInRangeIPv4(ipStr, start, end);
  }
  if (isIpv6(ipStr) && isIpv6(start) && isIpv6(end)) {
    return isIpInRangeIPv6(ipStr, start, end);
  }
  return false;
};

const compareIpv6 = (ip1, ip2) => {
  const ip1s = ip1.split(':');
  const ip2s = ip2.split(':');
  // loop to compare the corresponding items
  for (let i = 0; i < ip1s.length; i++) {
    if (ip1s[i] === '') {
      if (ip2s[i] === '') {
        // The corresponding items are all empty, compare next
        // eslint-disable-next-line no-continue
        continue;
      } else {
        return -1;
      }
    } else if (ip2s[i] === '') {
      return 1;
    } else {
      // make sure the corresponding item is not empty, convert the string to an integer for comparison
      const value1 = parseInt(ip1s[i], 16);
      const value2 = parseInt(ip2s[i], 16);
      if (value1 > value2) {
        return 1;
      }
      if (value1 < value2) {
        return -1;
      }
      // eslint-disable-next-line no-continue
      continue;
    }
  }
  // the loop ends, indicating that both strings represent the same address
  return 0;
};

const ipv4Validator = (item, value) => {
  const { required } = item;
  if (!isNil(value) && value !== '') {
    if (isIPv4(value)) {
      return Promise.resolve(true);
    }
    return Promise.reject(new Error(t('Invalid: Please input a valid ipv4')));
  }
  if (required && (isNil(value) || value === '')) {
    return Promise.reject();
  }
  return Promise.resolve(true);
};

const ipv6Validator = (item, value) => {
  const { required } = item;
  if (!isNil(value) && value !== '') {
    if (isIpv6(value)) {
      return Promise.resolve(true);
    }
    return Promise.reject(new Error(t('Invalid: Please input a valid ipv4')));
  }
  if (required && (isNil(value) || value === '')) {
    return Promise.reject();
  }
  return Promise.resolve(true);
};

export const ipValidate = {
  isIpWithMask,
  ipFull,
  isIPv4,
  isIpv6,
  isCidr,
  isIpCidr,
  isIPv6Cidr,
  isIPv6CidrOnly,
  isIpInRange,
  isIpInRangeIPv4,
  isIpInRangeIPv6,
  isIpInRangeAll,
  compareIpv6,
  ipv4Validator,
  ipv6Validator,
};

const isName = (value) => {
  if (value && isString(value)) {
    return nameRegex.test(value) && value.length <= 128;
  }
  return false;
};

const isFilename = (value) => {
  if (value && isString(value)) {
    return fileNameRegex.test(value);
  }
  return false;
};

const isSwiftFilename = (value) => {
  if (value && isString(value)) {
    return swiftFileNameRegex.test(value);
  }
  return false;
};

const isNameWithoutChinese = (value) => {
  if (value && isString(value)) {
    return nameRegexWithoutChinese.test(value) && value.length <= 128;
  }
  return false;
};

const isKeypairName = (value) => {
  if (value && isString(value)) {
    return keypairNameRegex.test(value) && value.length <= 128;
  }
  return false;
};

const isStackName = (value) => {
  if (value && isString(value)) {
    return stackNameRegex.test(value);
  }
  return false;
};

const isCrontabName = (value) => {
  if (value && isString(value)) {
    return crontabNameRegex.test(value);
  }
  return false;
};

const isImageName = (value) => {
  if (value && isString(value)) {
    return imageNameRegex.test(value);
  }
  return false;
};

const isInstanceName = (value) => {
  if (value && isString(value)) {
    return instanceNameRegex.test(value);
  }
  return false;
};

const nameMessage = t(
  'The name should start with upper letter, lower letter or chinese, and be a string of 1 to 128, characters can only contain "0-9, a-z, A-Z, "-\'_()[].:^".'
);

const nameMessageWithoutChinese = t(
  'The name should start with upper letter or lower letter, and be a string of 1 to 128, characters can only contain "0-9, a-z, A-Z, "-\'_()[].:^".'
);

const filenameMessage = t(
  'The name should start with upper letter, lower letter, and be a string of 3 to 63, characters can only contain "0-9, a-z, A-Z, -".'
);

const swiftFilenameMessage = t(
  'The name should start with upper letter, lower letter or chinese, and be a string of 3 to 63, characters can only contain "0-9, a-z, A-Z, chinese, -, .".'
);

const keypairNameMessage = t(
  'The name should start with upper letter, lower letter, and be a string of 1 to 128, characters can only contain "0-9, a-z, A-Z, -, _".'
);

const stackNameMessage = t(
  'The name should start with upper letter, lower letter, and be a string of 2 to 255, characters can only contain "0-9, a-z, A-Z, -, ., _".'
);

const crontabNameMessage = t(
  'The name should start with upper letter, lower letter or chinese, and be a string of 1 to 64, characters can only contain "0-9, a-z, A-Z, "-\'_()[].^".'
);

const imageNameMessage = t(
  'The name should start with upper letter, lower letter or chinese, and be a string of 1 to 128, characters can only contain "0-9, a-z, A-Z, "-\'_()[].".'
);

const instanceNameMessage = t(
  'The name should start with upper letter, lower letter or chinese, and be a string of 1 to 128, characters can only contain "0-9, a-z, A-Z, "-\'_.".'
);

const databaseNameMessage = t(
  'The name should contain letter or number, the length is 2 to 64, characters can only contain "0-9, a-z, A-Z, -, _."'
);

const databaseUserNameMessage = t(
  'The name should contain letter or number, the length is 1 to 16, characters can only contain "0-9, a-z, A-Z, -, _."'
);

export const nameMessageInfo = {
  nameMessage,
  nameMessageWithoutChinese,
  filenameMessage,
  keypairNameMessage,
  stackNameMessage,
  crontabNameMessage,
  imageNameMessage,
  instanceNameMessage,
  swiftFilenameMessage,
  databaseNameMessage,
  databaseUserNameMessage,
};

export const portMessage = t('Enter an integer value between 1 and 65535.');

export const rangeMessage = t(
  'The starting number must be less than the ending number'
);

export const portRangeMessage = t(
  'Input source port or port range (example: 80 or 80:160)'
);

export const macAddressMessage = t(
  'Invalid Mac Address. Please Use ":" as separator.'
);

const asciiMessage = t('Please enter a valid ASCII code');

export const databaseNameValidate = (rule, value) => {
  if (!rule.required && [undefined, null, ''].includes(value)) {
    return Promise.resolve(true);
  }
  if (isDatabaseName(value)) {
    return Promise.resolve(true);
  }
  return Promise.reject(new Error(`${t('Invalid: ')}${databaseNameMessage}`));
};

export const databaseUserNameValidate = (rule, value) => {
  if (!rule.required && [undefined, null, ''].includes(value)) {
    return Promise.resolve(true);
  }
  if (['os_admin', 'root'].includes(value)) {
    return Promise.reject(
      t('The root and os_admin are default users and cannot be created!')
    );
  }
  if (isDatabaseUserName(value)) {
    return Promise.resolve(true);
  }
  return Promise.reject(
    new Error(`${t('Invalid: ')}${databaseUserNameMessage}`)
  );
};

export const phoneNumberValidate = (rule, value) => {
  if (!rule.required && !value) {
    return Promise.resolve(true);
  }
  if (isPhoneNumber(value)) {
    return Promise.resolve(true);
  }
  return Promise.reject(new Error(`${t('Please enter a valid Phone Number')}`));
};

export const emailValidate = (rule, value) => {
  if (!rule.required && !value) {
    return Promise.resolve(true);
  }
  if (isEmailNumber(value)) {
    return Promise.resolve(true);
  }
  return Promise.reject(
    new Error(`${t('Please enter a valid Email Address!')}`)
  );
};

const nameValidate = (rule, value) => {
  if (!rule.required && [undefined, null, ''].includes(value)) {
    return Promise.resolve(true);
  }
  if (isName(value)) {
    return Promise.resolve(true);
  }
  return Promise.reject(new Error(`${t('Invalid: ')}${nameMessage}`));
};

const nameValidateWithoutChinese = (rule, value) => {
  if (!rule.required && [undefined, null, ''].includes(value)) {
    return Promise.resolve(true);
  }
  if (isNameWithoutChinese(value)) {
    return Promise.resolve(true);
  }
  return Promise.reject(
    new Error(`${t('Invalid: ')}${nameMessageWithoutChinese}`)
  );
};

const fileNameValidate = (rule, value) => {
  if (!rule.required && [undefined, null, ''].includes(value)) {
    return Promise.resolve(true);
  }
  if (isFilename(value)) {
    return Promise.resolve(true);
  }
  return Promise.reject(new Error(`${t('Invalid: ')}${filenameMessage}`));
};

const swiftFileNameValidate = (rule, value) => {
  if (!rule.required && [undefined, null, ''].includes(value)) {
    return Promise.resolve(true);
  }
  if (isSwiftFilename(value)) {
    return Promise.resolve(true);
  }
  return Promise.reject(new Error(`${t('Invalid: ')}${swiftFilenameMessage}`));
};

const keypairNameValidate = (rule, value) => {
  if (!rule.required && [undefined, null, ''].includes(value)) {
    return Promise.resolve(true);
  }
  if (isKeypairName(value)) {
    return Promise.resolve(true);
  }
  return Promise.reject(new Error(`${t('Invalid: ')}${keypairNameMessage}`));
};

const stackNameValidate = (rule, value) => {
  if (!rule.required && [undefined, null, ''].includes(value)) {
    return Promise.resolve(true);
  }
  if (isStackName(value)) {
    return Promise.resolve(true);
  }
  return Promise.reject(new Error(`${t('Invalid: ')}${stackNameMessage}`));
};

const crontabNameValidate = (rule, value) => {
  if (!rule.required && [undefined, null, ''].includes(value)) {
    return Promise.resolve(true);
  }
  if (isCrontabName(value)) {
    return Promise.resolve(true);
  }
  return Promise.reject(new Error(`${t('Invalid: ')}${crontabNameMessage}`));
};

const imageNameValidate = (rule, value) => {
  if (!rule.required && [undefined, null, ''].includes(value)) {
    return Promise.resolve(true);
  }
  if (isImageName(value)) {
    return Promise.resolve(true);
  }
  return Promise.reject(new Error(`${t('Invalid: ')}${imageNameMessage}`));
};

const instanceNameValidate = (rule, value) => {
  if (!rule.required && [undefined, null, ''].includes(value)) {
    return Promise.resolve(true);
  }
  if (isInstanceName(value)) {
    return Promise.resolve(true);
  }
  return Promise.reject(new Error(`${t('Invalid: ')}${instanceNameMessage}`));
};

export const nameTypeValidate = {
  nameValidate,
  nameValidateWithoutChinese,
  fileNameValidate,
  keypairNameValidate,
  stackNameValidate,
  crontabNameValidate,
  imageNameValidate,
  instanceNameValidate,
  swiftFileNameValidate,
  databaseNameValidate,
  databaseUserNameValidate,
};

export const cidrAllValidate = (rule, value) => {
  if (isIpCidr(value) || isIPv6Cidr(value)) {
    return Promise.resolve(true);
  }
  return Promise.reject(
    getErrorMessage(
      t('CIDR Format Error(e.g. 192.168.0.0/24, 2001:DB8::/48)'),
      true
    )
  );
};

export const macAddressValidate = (rule, value) => {
  if (isMacAddress(value.toUpperCase())) {
    return Promise.resolve(true);
  }
  return Promise.reject(new Error(`${t('Invalid: ')}${macAddressMessage}`));
};

export const portRangeValidate = (rule, value) => {
  const { required, message } = rule || {};
  if (!value && !required) {
    return Promise.resolve();
  }
  if (!value && required) {
    return Promise.reject(message || t('Please input'));
  }
  if (portRangeRegex(value)) {
    const ports = value.split(':');
    if (Number(ports[0]) > Number(ports[1])) {
      return Promise.reject(new Error(`${t('Invalid: ')}${rangeMessage}`));
    }
    return Promise.resolve();
  }
  return Promise.reject(new Error(`${t('Invalid: ')}${portMessage}`));
};

export const getPasswordOtherRule =
  (name, type, withoutPrefix, message) =>
  ({ getFieldValue }) => ({
    validator(rule, value) {
      let state = {};
      const hasPrefix = !withoutPrefix;
      if (name === 'password') {
        state = {
          oldPassword: getFieldValue('oldPassword'),
          password: value || getFieldValue('password'),
          confirmPassword: getFieldValue('confirmPassword'),
          hasPrefix,
          message,
        };
      } else {
        state = {
          confirmPassword: value || getFieldValue('confirmPassword'),
          password: getFieldValue('password'),
          oldPassword: getFieldValue('oldPassword'),
          hasPrefix,
          message,
        };
      }
      if (type === 'user') {
        state.oldPassword = getFieldValue('oldPassword');
      } else if (type === 'instance') {
        state.passwordType = 'instancePassword';
      }

      return passwordValidate(rule, value, state);
    },
  });

export const getErrorMessage = (message, hasPrefix) =>
  hasPrefix ? t('Invalid: ') + message : message;

export const passwordValidate = (rule, value, state) => {
  // eslint-disable-next-line no-unused-vars
  const {
    password,
    passwordType = 'other',
    oldPassword,
    hasPrefix = true,
    message,
  } = state;
  const { field } = rule;
  if (field === 'password') {
    const p1Regex =
      passwordType === 'instancePassword'
        ? instancePasswordRegex
        : passwordRegex;
    const errorMsg =
      passwordType === 'instancePassword'
        ? getErrorMessage(
            t(
              '8 to 16 characters, at least one uppercase letter, one lowercase letter, one number.'
            ),
            hasPrefix
          )
        : getErrorMessage(
            t(
              '8 to 32 characters, at least one uppercase letter, one lowercase letter, one number and one special character.'
            ),
            hasPrefix
          );
    if (!p1Regex.test(value)) {
      return Promise.reject(message || errorMsg);
    }
    // if (confirmPassword && value !== confirmPassword) {
    //   return Promise.reject(t('Invalid: Password must be the same with confirm password.'));
    // }
    if (oldPassword && password === oldPassword) {
      return Promise.reject(
        getErrorMessage(
          t('The new password cannot be identical to the current password.'),
          hasPrefix
        )
      );
    }
  }
  if (field === 'confirmPassword') {
    if (password && value !== password) {
      return Promise.reject(
        message ||
          getErrorMessage(
            t('Password must be the same with confirm password.'),
            hasPrefix
          )
      );
    }
  }
  return Promise.resolve();
};

export const jsonValidator = (item, value) => {
  if (value !== undefined && value !== '') {
    try {
      JSON.parse(value);
      return Promise.resolve(true);
    } catch (e) {
      return Promise.reject(new Error(t('Illegal JSON scheme')));
    }
  }
  return Promise.resolve(true);
};

export const asciiValidator = (rule, value) => {
  if (asciiRegex.test(value)) {
    return Promise.resolve(true);
  }
  return Promise.reject(new Error(`${t('Invalid: ')}${asciiMessage}`));
};
