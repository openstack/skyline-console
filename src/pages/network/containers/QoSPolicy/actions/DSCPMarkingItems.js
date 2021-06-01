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

const dscpMarkingItems =
  '0,8,10,12,14,16,18,20,22,24,26,28,30,32,34,36,38,40,46,48,56'
    .split(',')
    .map((item) => ({
      label: item,
      value: item,
    }));

export default dscpMarkingItems;
