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

export const getLocalStorageItem = (key) => {
  const item = localStorage.getItem(key);
  try {
    const { expires, value } = JSON.parse(item);
    if (Date.now() > expires) {
      localStorage.removeItem(key);
      return null;
    }

    return value;
  } catch (e) {
    return item;
  }
};

// 864000000: 10 days
export const setLocalStorageItem = (
  key,
  value,
  maxAge = 864000000,
  expiry = 0
) => {
  try {
    localStorage.setItem(
      key,
      JSON.stringify({
        expires: expiry || Date.now() + maxAge,
        value,
      })
    );
  } catch (e) {}
};

export const clearLocalStorage = (expectKeys = []) => {
  if (!expectKeys.length) {
    localStorage.clear();
    return;
  }
  const keys = Object.keys(localStorage);
  keys.forEach((key) => {
    if (!expectKeys.includes(key)) {
      localStorage.removeItem(key);
    }
  });
};
