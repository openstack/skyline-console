import { columnRender } from './table';

describe('column render test', () => {
  it('column render', () => {
    expect(columnRender(undefined, 'normal')).toBe('normal');
    expect(columnRender(undefined, 0)).toBe(0);
    expect(columnRender(undefined, false)).toBe('false');
    expect(columnRender(undefined, true)).toBe('true');
    expect(columnRender(undefined, [])).toBe('-');
    expect(columnRender(undefined, {})).toBe('-');
    expect(columnRender(undefined, undefined)).toBe('-');
    expect(columnRender(undefined, null)).toBe('-');

    expect(columnRender(() => 0, undefined)).toBe(0);
    expect(columnRender(() => false, undefined)).toBe('false');
    expect(columnRender(() => true, undefined)).toBe('true');
    expect(columnRender(() => [], undefined)).toBe('-');
    expect(columnRender(() => [1, 2, 3].join(','), undefined)).toBe('1,2,3');
    expect(columnRender(() => {}, undefined)).toBe('-');
    expect(columnRender(() => undefined, undefined)).toBe('-');
    expect(columnRender(() => null, undefined)).toBe('-');

    expect(columnRender(() => null, 0)).toBe('-');
    expect(columnRender(() => 0, 0)).toBe(0);
    expect(columnRender(() => false, 0)).toBe('false');
    expect(columnRender(() => [], 0)).toBe('-');
    expect(columnRender(() => {}, 0)).toBe('-');

    expect(
      columnRender(
        (value) => {
          return value + 1;
        },
        0,
        { val: 1 }
      )
    ).toBe(1);
    expect(
      columnRender(
        (_, record) => {
          return record.val + 1;
        },
        0,
        { val: 1 }
      )
    ).toBe(2);
    expect(
      columnRender(
        (_, record) => {
          return record.otherVal + 1;
        },
        0,
        { val: 1 }
      )
    ).toBe(NaN);
    expect(
      columnRender(
        (_, record) => {
          return record.otherVal;
        },
        0,
        { val: 1 }
      )
    ).toBe('-');
  });
});
