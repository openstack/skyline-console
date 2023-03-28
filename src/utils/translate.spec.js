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

import React from 'react';
import zhHans from '../../test/unit/locales/zh-hans';
import enUS from '../../test/unit/locales/en-US';
import ReactIntlUniversal from './translate';

const intl = new ReactIntlUniversal();
const locales = {
  'en-US': enUS,
  'zh-hans': zhHans,
};

describe('test translate', () => {
  it('Set specific locale', () => {
    intl.init({ locales, currentLocale: 'zh-hans' });
    expect(intl.get('SIMPLE')).toBe('简单');
    intl.init({ locales, currentLocale: 'en-US' });
    expect(intl.get('SIMPLE')).toBe('Simple');
  });

  it('Message with variables', () => {
    intl.init({ locales, currentLocale: 'en-US' });
    expect(intl.get('HELLO', { name: 'Tony' })).toBe('Hello, Tony');
  });

  it('Message with brace', () => {
    intl.init({ locales, currentLocale: 'en-US' });
    expect(intl.get('BRACE1')).toBe('The format is {var}');
    // eslint-disable-next-line no-template-curly-in-string
    expect(intl.get('BRACE2')).toBe('The format is ${var}');
  });

  it('Set specific locale with nested notation', () => {
    intl.init({ locales, currentLocale: 'en-US' });
    expect(intl.get('NESTED.HELLO')).toBe('Hello World');
    expect(intl.get('NESTED.HELLO_NAME', { name: 'World' })).toBe(
      'Hello, World'
    );
  });

  it('react-intl mirror API formatMessage:variables', () => {
    intl.init({ locales, currentLocale: 'en-US' });
    const name = 'Tony';
    expect(
      intl.formatMessage(
        { id: 'HELLO', defaultMessage: `Hello, {name}` },
        { name }
      )
    ).toBe(intl.get('HELLO', { name }));
  });

  it('react-intl mirror API formatMessage:defaultMessage', () => {
    intl.init({ locales, currentLocale: 'en-US' });
    expect(intl.formatMessage({ id: 'not-exist-key' })).toBe(
      intl.get('not-exist-key')
    );
  });

  it('react-intl mirror API formatHTMLMessage:variable', () => {
    intl.init({ locales, currentLocale: 'en-US' });
    const reactEl = intl.formatHTMLMessage(
      { id: 'TIP_VAR', defaultMessage: React.createElement('div') },
      {
        message: 'your message',
      }
    );
    expect(reactEl.props.dangerouslySetInnerHTML.__html).toBe(
      'This is<span>your message</span>'
    );
  });

  it('react-intl mirror API formatHTMLMessage:defaultMessage', () => {
    intl.init({ locales, currentLocale: 'en-US' });
    const reactEl = intl.formatHTMLMessage({
      id: 'not-exist-key',
      defaultMessage: React.createElement('div', { className: 'test' }),
    });
    expect(reactEl.type).toBe('span');
  });

  it('HTML Message without variables', () => {
    intl.init({ locales, currentLocale: 'en-US' });
    const reactEl = intl.getHTML('TIP');
    expect(reactEl.props.dangerouslySetInnerHTML.__html).toBe(
      'This is <span>HTML</span>'
    );
  });

  it('HTML Message with variables', () => {
    intl.init({ locales, currentLocale: 'en-US' });
    const reactEl = intl.getHTML('TIP_VAR', { message: 'your message' });
    expect(reactEl.props.dangerouslySetInnerHTML.__html).toBe(
      'This is<span>your message</span>'
    );
  });

  it('HTML Message without variables', () => {
    intl.init({ locales, currentLocale: 'en-US' });
    const reactEl = intl.getHTML('TIP');
    expect(reactEl.props.dangerouslySetInnerHTML.__html).toBe(
      'This is <span>HTML</span>'
    );
  });

  it('HTML Message with variables', () => {
    intl.init({ locales, currentLocale: 'en-US' });
    const reactEl = intl.getHTML('TIP_VAR', {
      message: 'your message',
    });
    expect(reactEl.props.dangerouslySetInnerHTML.__html).toBe(
      'This is<span>your message</span>'
    );
  });

  it('HTML Message with XSS attack', () => {
    intl.init({ locales, currentLocale: 'en-US' });
    const reactEl = intl.getHTML('TIP_VAR', {
      message: '<script>alert(1)</script>',
    });
    expect(reactEl.props.dangerouslySetInnerHTML.__html).toBe(
      'This is<span>&lt;script&gt;alert(1)&lt;/script&gt;</span>'
    );
  });

  it('HTML Message with disable escape html', () => {
    intl.init({ locales, currentLocale: 'en-US', escapeHtml: false });
    const reactEl = intl.getHTML('TIP_VAR', {
      message: '<script>alert(1)</script>',
    });
    expect(reactEl.props.dangerouslySetInnerHTML.__html).toBe(
      'This is<span><script>alert(1)</script></span>'
    );
  });

  it('Message with Date', () => {
    const start = new Date('Fri Apr 07 2017 17:08:33');
    intl.init({ locales, currentLocale: 'en-US' });
    expect(
      intl.get('SALE_START', {
        start,
      })
    ).toBe('Sale begins 4/7/2017');
    expect(
      intl.get('SALE_END', {
        start,
      })
    ).toBe('Sale begins April 7, 2017');
  });

  it('Message with plural', () => {
    intl.init({ locales, currentLocale: 'en-US' });
    expect(
      intl.get('PHOTO', {
        num: 0,
      })
    ).toBe('You have no photos.');
    expect(
      intl.get('PHOTO', {
        num: 1,
      })
    ).toBe('You have one photo.');
    expect(
      intl.get('PHOTO', {
        num: 10,
      })
    ).toBe('You have 10 photos.');

    intl.init({ locales, currentLocale: 'zh-hans' });
    expect(
      intl.get('PHOTO', {
        num: 1,
      })
    ).toBe('你有1张照片');
  });

  it('Message with skeleton', () => {
    intl.init({ locales, currentLocale: 'en-US' });
    expect(
      intl.get('SKELETON_VAR', {
        value: 42.5,
      })
    ).toBe('Increase by 42.5');

    expect(
      intl.get('SKELETON_VAR', {
        value: 42,
      })
    ).toBe('Increase by 42.0');

    expect(
      intl.get('SKELETON_VAR', {
        value: 42.109,
      })
    ).toBe('Increase by 42.11');

    expect(
      intl.get('SKELETON_SELECTORDINAL', {
        year: 2,
      })
    ).toBe("It's my cat's 2nd birthday!");

    expect(
      intl.get('SKELETON_SELECTORDINAL', {
        year: 10,
      })
    ).toBe("It's my cat's 10th birthday!");
  });

  it('Get locale from localStorage', () => {
    localStorage.setItem('lang', 'en-US');
    expect(
      intl.getLocaleFromLocalStorage({ localStorageLocaleKey: 'lang' })
    ).toBe('en-US');
  });

  it('Get locale from browser', () => {
    expect(intl.getLocaleFromBrowser()).toBe('en-US');
  });

  it('Get dot key variables', () => {
    intl.init({ locales, currentLocale: 'en-US' });
    expect(intl.get('DOT.HELLO')).toBe('Hello World');
  });

  it('Get init options', () => {
    intl.init({ locales, currentLocale: 'en-US' });
    const { currentLocale } = intl.getInitOptions();
    expect(currentLocale).toBe('en-US');
  });

  it('Uses fallback locale if key not found in currentLocale', () => {
    intl.init({ locales, currentLocale: 'zh-hans', fallbackLocale: 'en-US' });
    expect(intl.get('ONLY_IN_ENGLISH')).toBe('ONLY_IN_ENGLISH');
  });

  it('Resolve language url if currentLocale was matched', async () => {
    const result = await intl.init({ locales, currentLocale: 'en' });
    expect(result).toBe(undefined);
  });
});
