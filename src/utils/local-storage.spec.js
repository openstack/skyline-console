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

import {
  getLocalStorageItem,
  setLocalStorageItem,
  clearLocalStorage,
} from './local-storage';

describe('test localstorage', () => {
  it('getLocalStorageItem', () => {
    localStorage.setItem('key', 'value');
    expect(getLocalStorageItem('key')).toBe('value');
    localStorage.clear();
  });

  it('setLocalStorageItem', () => {
    const expires = Date.now() + 864000000;
    setLocalStorageItem('key', 'value', 0, expires);
    expect(localStorage.getItem('key')).toEqual(
      JSON.stringify({
        expires,
        value: 'value',
      })
    );
    localStorage.clear();
  });

  it('localStorage', () => {
    expect(getLocalStorageItem('key')).toBe(null);
    setLocalStorageItem('key', 'value');
    expect(getLocalStorageItem('key')).toBe('value');
    setLocalStorageItem('key', 'value', -1);
    expect(getLocalStorageItem('key')).toBe(null);
    localStorage.clear();
  });

  it('clearLocalStorage - clear all', () => {
    expect(getLocalStorageItem('key1')).toBe(null);
    expect(getLocalStorageItem('key2')).toBe(null);
    setLocalStorageItem('key1', 'value1');
    setLocalStorageItem('key2', 'value2');
    expect(getLocalStorageItem('key1')).toBe('value1');
    expect(getLocalStorageItem('key2')).toBe('value2');
    clearLocalStorage();
    expect(getLocalStorageItem('key1')).toBe(null);
    expect(getLocalStorageItem('key2')).toBe(null);
    localStorage.clear();
  });

  it('clearLocalStorage - clear with expect', () => {
    expect(getLocalStorageItem('key1')).toBe(null);
    expect(getLocalStorageItem('key2')).toBe(null);
    setLocalStorageItem('key1', 'value1');
    setLocalStorageItem('key2', 'value2');
    expect(getLocalStorageItem('key1')).toBe('value1');
    expect(getLocalStorageItem('key2')).toBe('value2');
    clearLocalStorage(['key1']);
    expect(getLocalStorageItem('key1')).toBe('value1');
    expect(getLocalStorageItem('key2')).toBe(null);
    localStorage.clear();
  });
});
