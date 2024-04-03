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

import React, { useEffect } from 'react';
import globalContainersStore from 'src/stores/zun/containers';

export default function Console(props) {
  useEffect(() => {
    globalContainersStore.attach(props.detail.uuid).then((res) => {
      const { head } = document;

      const xtermCssLink = document.createElement('link');
      xtermCssLink.rel = 'stylesheet';
      xtermCssLink.href =
        'https://cdn.jsdelivr.net/npm/xterm@4.19.0/css/xterm.css';
      head.appendChild(xtermCssLink);

      const xtermScript = document.createElement('script');
      xtermScript.src =
        'https://cdnjs.cloudflare.com/ajax/libs/xterm/3.14.5/xterm.min.js';

      xtermScript.onload = () => {
        const term = new window.Terminal({
          cursorBlink: true,
        });
        term.write(' >$ ');
        term.open(document.getElementById('terminal'));
        const socket = new WebSocket(res, ['binary', 'base64']);
        term.on('data', function (data) {
          socket.send(str2ab(data));
        });
        socket.onmessage = function (e) {
          if (e.data instanceof Blob) {
            const f = new FileReader();
            f.onload = function () {
              term.write(f.result);
            };
            f.readAsText(e.data);
          } else {
            term.write(e.data);
          }
        };
        function str2ab(str) {
          const buf = new ArrayBuffer(str.length); // 2 bytes for each char
          const bufView = new Uint8Array(buf);
          for (let i = 0, strLen = str.length; i < strLen; i++) {
            bufView[i] = str.charCodeAt(i);
          }
          return buf;
        }
      };
      head.appendChild(xtermScript);

      return () => {
        head.removeChild(xtermCssLink);
        head.removeChild(xtermScript);
      };
    });
  }, []);

  return (
    <div>
      <div id="terminal" />
    </div>
  );
}
