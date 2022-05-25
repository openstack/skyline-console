import moment from 'moment';
import { timeFormatStr } from 'utils/time';
import {
  groupArray,
  bytesFilter,
  computePercentage,
  firstUpperCase,
  formatSize,
  formatUsedTime,
  generateArray,
  generateId,
  getGiBValue,
  getNoValue,
  getOptions,
  getOptionsWithNoSet,
  getQueryString,
  getYesNo,
  getYesNoList,
  NoSetValue,
  toLocalTimeFilter,
  updateAddSelectValueToObj,
  updateObjToAddSelectArray,
  uppercaseFilter,
  unescapeHtml,
  isAdminPage,
} from 'utils/index';

describe('test utils index.js', () => {
  it('formatSize', () => {
    expect(formatSize(null)).toBe('-');
    expect(formatSize(undefined)).toBe('-');
    expect(formatSize(NaN)).toBe('-');
    expect(formatSize('')).toBe('-');
    expect(formatSize(1000)).toBe('1000 B');
    expect(formatSize(128012010202)).toBe('119.22 GiB');
    expect(formatSize('128012010202')).toBe('128012010202');
    expect(formatSize(10000 * 1024 ** 8)).toBe('9.77 BiB');
    expect(formatSize(10000 * 1024 ** 9)).toBe('10000.00 BiB');
  });

  it('formatUsedTime', () => {
    expect(formatUsedTime(900)).toBe('900 ms');
    expect(formatUsedTime(50000)).toBe('50.00 s');
    expect(formatUsedTime(3000000)).toBe('50.00 min');
    expect(formatUsedTime(30000000)).toBe('8.33 h');
  });

  it('generateId', () => {
    expect(generateId()).toHaveLength(6);
    expect(generateId(10)).toHaveLength(10);
  });

  it('getQueryString', () => {
    expect(getQueryString({ a: '', b: 'xxx', c: 'yyy' })).toBe('b=xxx&c=yyy');
  });

  it('getYesNo', () => {
    expect(getYesNo(1)).toBe(t('Yes'));
    expect(getYesNo(true)).toBe(t('Yes'));
    expect(getYesNo(false)).toBe(t('No'));
    expect(getYesNo(null)).toBe(t('No'));
    expect(getYesNo(undefined)).toBe(t('No'));
    expect(getYesNo(NaN)).toBe(t('No'));
    expect(getYesNo('')).toBe(t('No'));
    expect(getYesNo(0)).toBe(t('No'));
  });

  it('getGiBValue', () => {
    expect(getGiBValue(1024)).toBe(1);
    expect(getGiBValue(2 * 1024)).toBe(2);
    expect(getGiBValue(2.554 * 1024)).toBe(2.55);
    expect(getGiBValue(2.555 * 1024)).toBe(2.56);
    expect(getGiBValue(2.556 * 1024)).toBe(2.56);
    expect(getGiBValue(true)).toBe(0);
    expect(getGiBValue(false)).toBe(0);
    expect(getGiBValue(null)).toBe(0);
    expect(getGiBValue(undefined)).toBe(0);
    expect(getGiBValue(NaN)).toBe(0);
    expect(getGiBValue('')).toBe(0);
    expect(getGiBValue(0)).toBe(0);
  });

  it('getNoValue', () => {
    expect(getNoValue(123)).toBe(123);
    expect(getNoValue('123')).toBe('123');
    expect(getNoValue(true)).toBe(true);
    expect(getNoValue(false)).toBe(false);
    expect(getNoValue(null)).toBe('-');
    expect(getNoValue(undefined)).toBe('-');
    expect(getNoValue(NaN)).toBe(NaN);
    expect(getNoValue('')).toBe('-');
    expect(getNoValue(0)).toBe(0);
  });

  it('firstUpperCase', () => {
    expect(firstUpperCase(123)).toBe(123);
    expect(firstUpperCase('123')).toBe('123');
    expect(firstUpperCase('abc')).toBe('Abc');
    expect(firstUpperCase('ABC')).toBe('ABC');
    expect(firstUpperCase(true)).toBe(true);
    expect(firstUpperCase(false)).toBe(false);
    expect(firstUpperCase(null)).toBe(null);
    expect(firstUpperCase(undefined)).toBe(undefined);
    expect(firstUpperCase(NaN)).toBe(NaN);
    expect(firstUpperCase('')).toBe('');
    expect(firstUpperCase(0)).toBe(0);
  });

  it('bytesFilter', () => {
    expect(bytesFilter(-1)).toBe('');
    expect(bytesFilter(NaN)).toBe('');
    expect(bytesFilter(100)).toBe(t('{ size } bytes', { size: '100' }));
    expect(bytesFilter(1024)).toBe(t('{ size } KiB', { size: '1.00' }));
    expect(bytesFilter(10 * 1024 ** 2)).toBe(
      t('{ size } MiB', { size: '10.00' })
    );
    expect(bytesFilter(1024 ** 2)).toBe(t('{ size } MiB', { size: '1.00' }));
    expect(bytesFilter(1024 ** 3)).toBe(t('{ size } GiB', { size: '1.00' }));
    expect(bytesFilter(1024 ** 4)).toBe(t('{ size } TiB', { size: '1.00' }));
    expect(bytesFilter(3.15 * 1024 ** 4)).toBe(
      t('{ size } TiB', { size: '3.15' })
    );
  });

  it('uppercaseFilter', () => {
    expect(uppercaseFilter(123)).toBe('-');
    expect(uppercaseFilter('123')).toBe('123');
    expect(uppercaseFilter('abc')).toBe('ABC');
    expect(uppercaseFilter('AbC')).toBe('ABC');
    expect(uppercaseFilter('ABC')).toBe('ABC');
    expect(uppercaseFilter(true)).toBe('-');
    expect(uppercaseFilter(false)).toBe('-');
    expect(uppercaseFilter(null)).toBe('-');
    expect(uppercaseFilter(undefined)).toBe('-');
    expect(uppercaseFilter(NaN)).toBe('-');
    expect(uppercaseFilter('')).toBe('-');
    expect(uppercaseFilter(0)).toBe('-');
  });

  it('toLocalTimeFilter', () => {
    expect(toLocalTimeFilter(1622025465 * 1000)).toBe(
      moment.unix(1622025465).format(timeFormatStr.YMDHms)
    );
    const now = moment();
    expect(toLocalTimeFilter(now.clone().utc().format())).toBe(
      now.clone().format(timeFormatStr.YMDHms)
    );
  });

  it('getOptions', () => {
    expect(
      getOptions({
        key1: 'Key1',
        key2: 'Key2',
      })
    ).toEqual([
      {
        label: 'Key1',
        value: 'key1',
        key: 'key1',
      },
      {
        label: 'Key2',
        value: 'key2',
        key: 'key2',
      },
    ]);
  });

  it('getYesNoList', () => {
    expect(getYesNoList()).toEqual([
      { value: true, label: t('Yes') },
      { value: false, label: t('No') },
    ]);
  });

  it('generateArray', () => {
    expect(generateArray(1, 10)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(generateArray(-10, -1)).toEqual([
      -10, -9, -8, -7, -6, -5, -4, -3, -2,
    ]);
    expect(generateArray(-2, 2)).toEqual([-2, -1, 0, 1]);
  });

  it('getOptionsWithNoSet', () => {
    expect(
      getOptionsWithNoSet({
        key1: 'Key1',
        key2: 'Key2',
      })
    ).toEqual([
      {
        value: NoSetValue,
        label: t('Not select'),
      },
      {
        label: 'Key1',
        value: 'key1',
        key: 'key1',
      },
      {
        label: 'Key2',
        value: 'key2',
        key: 'key2',
      },
    ]);
  });

  it('computePercentage', () => {
    expect(computePercentage(10, 20)).toBe(50.0);
    expect(computePercentage(1, 3)).toBe(33.33);
    expect(computePercentage(2, 5)).toBe(40);
    expect(computePercentage(7, 8)).toBe(87.5);
    expect(computePercentage(2, 3)).toBe(66.67);
  });

  it('groupArray', () => {
    expect(groupArray([1, 2, 3], 3)).toEqual([[1, 2, 3]]);
    expect(groupArray([1, 2, 3], 2)).toEqual([[1, 2], [3]]);
    expect(groupArray([1, 2, 3], 1)).toEqual([[1], [2], [3]]);
  });

  it('updateObjToAddSelectArray', () => {
    expect(
      updateObjToAddSelectArray({
        key1: 'Key1',
        key2: 'Key2',
      })
    ).toEqual([
      {
        index: 0,
        value: {
          key: 'key1',
          value: 'Key1',
        },
      },
      {
        index: 1,
        value: {
          key: 'key2',
          value: 'Key2',
        },
      },
    ]);
  });

  it('updateAddSelectValueToObj', () => {
    expect(
      updateAddSelectValueToObj([
        {
          value: {
            key: 'key1',
            value: 'Key1',
          },
        },
        {
          value: {
            key: 'key2',
            value: 'Key2',
          },
        },
      ])
    ).toEqual({
      key1: 'Key1',
      key2: 'Key2',
    });
  });

  it('unescapeHtml', () => {
    expect(unescapeHtml('fred, barney, &amp; pebbles')).toBe(
      'fred, barney, & pebbles'
    );
    expect(unescapeHtml('fred, barney, &quot; pebbles')).toBe(
      'fred, barney, " pebbles'
    );
    expect(unescapeHtml('fred, barney, &lt; pebbles')).toBe(
      'fred, barney, < pebbles'
    );
    expect(unescapeHtml('fred, barney, &gt; pebbles')).toBe(
      'fred, barney, > pebbles'
    );
  });

  it('isAdminPage', () => {
    expect(isAdminPage('admin')).toBe(true);
    expect(isAdminPage('/admin/')).toBe(true);
    expect(isAdminPage('/a/b/c/admin/d/e/f')).toBe(true);
    expect(isAdminPage('/a/d/m/i/n')).toBe(false);
  });
});
