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

// Use quoted cells and CRLF records so commas, quotes and Unicode service
// names survive spreadsheet imports. Only text cells need formula escaping;
// negative numeric costs must remain usable as numbers.
const textCell = (value) => {
  const text = String(value);
  const safe = /^[\s]*[=+@-]|^[\t\r\n]/.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
};

const costCell = (value) => Number(value || 0).toFixed(5);

export const buildReportingCsv = ({
  begin,
  end,
  repartition = [],
  timeline = [],
  totalCost = 0,
}) => {
  // Keep summary order consistent with the table and daily columns consistent
  // with the summary. Include any daily-only types rather than dropping costs.
  const types = [
    ...new Set([
      ...repartition.map((item) => item.type),
      ...timeline.flatMap((point) => Object.keys(point.perType)),
    ]),
  ];
  const rows = [
    [textCell('CloudKitty Cost Report')],
    [textCell('Period Start (UTC)'), textCell(begin)],
    [textCell('Period End (UTC, inclusive)'), textCell(end)],
    [
      textCell('Cost Precision'),
      textCell('5 decimal places; no currency assumed'),
    ],
    [],
    [textCell('Cost by Service Type')],
    [
      textCell('Service Type'),
      textCell('Cost'),
      textCell('Share of Total (%)'),
    ],
    ...repartition.map(({ type, rate }) => [
      textCell(type),
      costCell(rate),
      totalCost > 0 ? ((rate / totalCost) * 100).toFixed(1) : '',
    ]),
    [textCell('Total'), costCell(totalCost), totalCost > 0 ? '100.0' : ''],
    [],
    [textCell('Daily Cost Breakdown')],
    [textCell('Date (UTC)'), ...types.map(textCell), textCell('Daily Total')],
    ...timeline.map(({ date, perType, total }) => [
      textCell(date),
      ...types.map((type) => costCell(perType[type])),
      costCell(total),
    ]),
  ];
  // UTF-8 BOM preserves non-ASCII names when opened directly in Excel.
  return `\uFEFF${rows.map((row) => row.join(',')).join('\r\n')}\r\n`;
};

export const reportingCsvFilename = ({ begin, end }) =>
  `cloudkitty-report-${begin}-to-${end}.csv`;
