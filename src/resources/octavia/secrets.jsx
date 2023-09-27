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

export const certificateContentTip = (
  <div>
    <p>
      {t(
        'The certificate contains information such as the public key and signature of the certificate. The extension of the certificate is "pem" or "crt", you can directly enter certificate content or upload certificate file.'
      )}
    </p>
    <p>
      {t(
        'It is recommended to refer to the following description format, otherwise it may not be effective'
      )}
    </p>
    <p>
      {t(
        'The format of the certificate content is: by "----BEGIN CERTIFICATE-----" as the beginning,"-----END CERTIFICATE----" as the end, 64 characters per line, the last line does not exceed 64 characters, and there cannot be blank lines.'
      )}
    </p>
  </div>
);

export const certificateKeyPairTip = (
  <div>
    <p>
      {t(
        'The private key of the certificate, the extension of the private key is "key", you can directly enter the content of the private key file or upload a private key that conforms to the format document.'
      )}
    </p>
    <p>
      {t(
        'It is recommended to refer to the following description format, otherwise it may not be effective'
      )}
    </p>
    <p>
      {t(
        'The private key content format is: with "-----BEGIN RSA PRIVATE KEY-----" as the beginning,"-----END RSA PRIVATE KEY-----" as the end, 64 characters per line, the last line does not exceed 64 characters, and there cannot be blank lines.'
      )}
    </p>
  </div>
);
